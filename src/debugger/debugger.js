import * as dom from "./dom-elements.js";
import strings from "./strings.js";

import {
    deepClone,
    findKey,
    derToPem,
    x5cArrayToCertInfo,
    prettyStringify,
    cborEncoder,
    getErrorMessage,
    getSelectValue,
    transform,
} from "./utils.js";

import { prettifyTransformations, binToHex } from "./transformations.js";

import {
    parseCredentials,
    prettifyCredentials,
    prettyCredentialsWithHtml,
    orderCredentialsByType,
    getUserPresentStatus,
} from "./output-parser.js";

import log from "loglevel";
import cbor from "cbor";
import { saveAs } from "file-saver";
import coseToJwk from "cose-to-jwk";
import tippy from "tippy.js";
import jkwToPem from "jwk-to-pem";

let lastCredentials;
let lastCredentialsParsed;

const pubKeyParams = [
    dom.createForm.pubKeyCredParams.algos[0].select,
    dom.createForm.pubKeyCredParams.algos[1].select,
];

const excludedCredentials = [{
    id: dom.createForm.excludeCredentials.id.line,
    upload: dom.createForm.excludeCredentials.id.buttonBin,
    file: dom.createForm.excludeCredentials.file,
    type: {
        checkbox: dom.createForm.excludeCredentials.type.checkbox,
        usb: dom.createForm.excludeCredentials.type.usbCheckbox,
        nfc: dom.createForm.excludeCredentials.type.nfcCheckbox,
        ble: dom.createForm.excludeCredentials.type.bleCheckbox,
        internal: dom.createForm.excludeCredentials.type.internalCheckbox,
    },
}, ];

const allowedCredentials = [{
    id: dom.getForm.allowCredentials.id.span,
    upload: dom.getForm.allowCredentials.id.upload,
    file: dom.getForm.allowCredentials.id.file,
    paste: dom.getForm.allowCredentials.id.paste,
    type: {
        checkbox: dom.getForm.allowCredentials.type.checkbox,
        usb: dom.getForm.allowCredentials.type.usbCheckbox,
        nfc: dom.getForm.allowCredentials.type.nfcCheckbox,
        ble: dom.getForm.allowCredentials.type.bleCheckbox,
        internal: dom.getForm.allowCredentials.type.internalCheckbox,
    },
}, ];

const globalOptions = {
    challenge: new Uint8Array(32),
    userId: new Uint8Array(32),
};

function getAlgValueFromSelect(select) {
    const values = {
        es256: -7,
        edDSA: -8,
        es384: -35,
        es512: -36,
        rs256: -257,
    };
    return values[select.options[select.selectedIndex].value];
}

window.outputButtonClick = function outputButtonClick(event) {
    const key = event.target.dataset.key;
    if (!key) {
        log.error("Missing key for output button? Event: ", event);
        return;
    }

    const value = findKey(lastCredentialsParsed, key);
    const text = event.target.firstChild.textContent.toLowerCase();

    if (text.includes("view")) {
        const modalText = x5cArrayToCertInfo(value);
        dom.output.keyModal.pre.textContent = modalText;
        dom.output.keyModal.modal.classList.add("is-active");
    } else if (text.includes("download")) {
        switch (key) {
            case "rawId":
                saveAs(new Blob([value]), "rawId.bin");
                break;
            case "sig":
            case "signature":
                saveAs(new Blob([value]), `${key}.bin`);
                break;
            case "x5c":
                if (text.includes("pem")) {
                    const pems = value.map(derToPem);
                    const joined = pems.join("\r\n");
                    saveAs(new Blob([joined]), "x5c.pem");
                }
                break;
            case "credentialPublicKey":
                if (text.includes("jwk")) {
                    saveAs(
                        new Blob([prettyStringify(coseToJwk(value))]),
                        "credentialPublicKey.jwk"
                    );
                } else if (text.includes("pem")) {
                    saveAs(
                        new Blob([jkwToPem(coseToJwk(value))]),
                        "credentialPublicKey.pem"
                    );
                } else if (text.includes("cose")) {
                    saveAs(new Blob([value]), "credentialPublicKey.cose");
                }
                break;
        }
    }
};

function getCreateOptions() {
    const cForm = dom.createForm;

    const publicKey = {
        rp: {
            name: cForm.relyingParty.name.input.value,
        },
        user: {
            id: globalOptions.userId,
            name: cForm.user.name.input.value,
            displayName: cForm.user.displayName.input.value,
        },
        challenge: globalOptions.challenge,
        pubKeyCredParams: pubKeyParams.map((select) => ({
            type: "public-key",
            alg: getAlgValueFromSelect(select),
        })),
        timeout: cForm.timeout.input.value,
    };

    if (cForm.excludeCredentials.checkbox.checked) {
        publicKey.excludeCredentials = excludedCredentials.map((ec) => {
            const result = {
                type: "public-key",
                id: Buffer.from(ec.id.value, "hex"),
            };

            if (ec.type.checkbox.checked) {
                const transports = [];

                if (ec.type.usb.checked) {
                    transports.push("usb");
                }

                if (ec.type.nfc.checked) {
                    transports.push("nfc");
                }

                if (ec.type.ble.checked) {
                    transports.push("ble");
                }

                if (ec.type.internal.checked) {
                    transports.push("internal");
                }

                result.transports = transports;

                return result;
            }
        });
    }

    if (cForm.authenticatorSelection.checkbox.checked) {
        const authenticatorSelection = {};

        if (cForm.authenticatorSelection.authenticatorAttachment.checkbox.checked) {
            authenticatorSelection.authenticatorAttachment = getSelectValue(
                cForm.authenticatorSelection.authenticatorAttachment.select
            );
        }

        if (cForm.authenticatorSelection.residentKey.checkbox.checked) {
            authenticatorSelection.residentKey = getSelectValue(
                cForm.authenticatorSelection.residentKey.select
            );
        }

        if (cForm.authenticatorSelection.requireResidentKey.checkbox.checked) {
            authenticatorSelection.requireResidentKey =
                cForm.authenticatorSelection.requireResidentKey.checkbox.checked;
        }

        if (cForm.authenticatorSelection.userVerification.checkbox.checked) {
            authenticatorSelection.userVerification = getSelectValue(
                cForm.authenticatorSelection.userVerification.select
            );
        }

        publicKey.authenticatorSelection = authenticatorSelection;
    }

    if (dom.createForm.attestation.checkbox.checked) {
        publicKey.attestation = getSelectValue(dom.createForm.attestation.select);
    }

    if (cForm.extensions.checkbox.checked) {

        const extensions = {};

        if (cForm.extensions.credProps.checkbox.checked) {
            extensions.credProps =
                cForm.extensions.credProps.checkbox.checked;
        }

        if (cForm.extensions.credProtectPolicy.checkbox.checked) {
            extensions.credentialProtectionPolicy =  getSelectValue(
                cForm.extensions.credProtectPolicy.select
            );
        }

        if (cForm.extensions.credProtectEnforce.checkbox.checked) {
            extensions.enforceCredentialProtectionPolicy = 
                cForm.extensions.credProtectEnforce.checkbox.checked;
        }

        if (cForm.extensions.minPinLength.checkbox.checked) {
            extensions.minPinLength =
                cForm.extensions.minPinLength.checkbox.checked;
        }

        if (cForm.extensions.uvm.checkbox.checked) {
            extensions.uvm =
                cForm.extensions.uvm.checkbox.checked;
        }

        publicKey.extensions = extensions;
    }

    return {
        publicKey: publicKey,
    };
}

function handleRegistrationCredentials(credentials) {
    lastCredentials = deepClone(credentials);
    lastCredentialsParsed = parseCredentials(credentials);

    const prettyCredentials = prettifyCredentials(
        orderCredentialsByType(credentials)
    );

    const withHtml = prettyCredentialsWithHtml(prettyCredentials);

    log.debug(prettyCredentials);
    log.debug(withHtml);

    dom.output.registration.console.innerHTML = withHtml;
    dom.output.registration.rawId.innerHTML = binToHex(credentials.rawId);

    if (lastCredentialsParsed.response.attestationObject &&
        lastCredentialsParsed.response.attestationObject.authData.attestedCredentialData.credentialPublicKey) {
        dom.output.registration.publicKey.innerHTML = prettyStringify(
            coseToJwk(
                lastCredentialsParsed.response.attestationObject.authData
                .attestedCredentialData.credentialPublicKey,
                2
            )
        ).replace(/[{\n][}\n]/g, "");
    }
}

function handleCBORCredentials(credentials) {
    lastCredentials = deepClone(credentials);
    lastCredentialsParsed = parseCredentials(credentials);

    const prettyCredentials = prettifyCredentials(
        orderCredentialsByType(credentials)
    );

    const withHtml = prettyCredentialsWithHtml(prettyCredentials);

    log.debug(prettyCredentials);
    log.debug(withHtml);

    dom.output.cbor.console.innerHTML = withHtml;
    dom.output.cbor.rawId.innerHTML = binToHex(credentials.rawId);

    if (lastCredentialsParsed.response.attestationObject) {
        dom.output.cbor.publicKey.innerHTML = prettyStringify(
            coseToJwk(
                lastCredentialsParsed.response.attestationObject.authData
                .attestedCredentialData.credentialPublicKey,
                2
            )
        ).replace(/[{\n][}\n]/g, "");
    }
}

function handleAuthenticationCredentials(credentials) {
    lastCredentials = deepClone(credentials);
    lastCredentialsParsed = parseCredentials(credentials);

    const prettyCredentials = prettifyCredentials(
        orderCredentialsByType(credentials)
    );

    const withHtml = prettyCredentialsWithHtml(prettyCredentials);

    log.debug(prettyCredentials);
    log.debug(withHtml);

    dom.output.authentication.console.innerHTML = withHtml;

    if (lastCredentialsParsed.response.signature) {
        dom.output.authentication.signature.innerHTML = binToHex(
            lastCredentialsParsed.response.signature
        );
    }

    if (lastCredentialsParsed.response.clientDataJSON.challenge) {
        dom.output.authentication.challenge.innerHTML = binToHex(
            lastCredentialsParsed.response.clientDataJSON.challenge
        );
    }
}

function useLastRawId(rawId) {
    let last = allowedCredentials.length - 1;
    if (allowedCredentials[last].id.textContent.length !== 0) {
        addAllowedCredential();
        ++last;
    }

    const ac = allowedCredentials[last];
    ac.id.textContent = rawId.substr(0, 8) + "...";
    ac.id.value = rawId;
}

async function register() {
    try {
        const options = getCreateOptions()
        console.log("navigator.credentials.create:", options);
        const credentials = await navigator.credentials.create(options);
        handleRegistrationCredentials(credentials);
        useLastRawId(binToHex(credentials.rawId));
        dom.output.registration.output.classList.remove("is-invisible");

        const userPresent = getUserPresentStatus(credentials);
        if (!userPresent) {
            dom.output.userPresenceWarning.classList.remove("hidden");
        }
    } catch (e) {
        log.debug(e);
        console.error(e);
        dom.output.registration.console.textContent = getErrorMessage(e);
        dom.output.registration.output.classList.remove("is-invisible");
    }
}

function getGetOptions() {
    const gForm = dom.getForm;

    const publicKey = {
        challenge: globalOptions.challenge,
        timeout: gForm.timeout.input.value,
    };

    if (gForm.rpId.checkbox.checked) {
        publicKey.rpId = gForm.rpId.input.value;
    }

    // TODO: handle multiple credentials
    if (gForm.allowCredentials.checkbox.checked) {
        publicKey.allowCredentials = allowedCredentials
            .filter((ac) => {
                return ac.id.value;
            })
            .map((ac) => {
                const result = {
                    type: "public-key",
                    id: Buffer.from(ac.id.value, "hex"),
                };

                if (ac.type.checkbox.checked) {
                    result.transports = [];
                    if (ac.type.usb.checked) {
                        result.transports.push("usb");
                    }
                    if (ac.type.nfc.checked) {
                        result.transports.push("nfc");
                    }
                    if (ac.type.ble.checked) {
                        result.transports.push("ble");
                    }
                    if (ac.type.internal.checked) {
                        result.transports.push("internal");
                    }
                }

                return result;
        });
    }

    if (gForm.userVerification.checkbox.checked) {
        publicKey.userVerification = getSelectValue(gForm.userVerification.select);
    }

    if (gForm.extensions.checkbox.checked) {

        const extensions = {};

        if (gForm.extensions.uvm.checkbox.checked) {
            extensions.uvm =
                gForm.extensions.uvm.checkbox.checked;
        }

        publicKey.extensions = extensions;
    }

    const result = {
        publicKey: publicKey,
    };

    if (gForm.mediation.checkbox.checked) {
        result.mediation = getSelectValue(gForm.mediation.select);
    }

    return result;
}

async function authenticate() {
    try {
        const options = getGetOptions()
        console.log("navigator.credentials.get:", options);
        const credentials = await navigator.credentials.get(options);
        handleAuthenticationCredentials(credentials);
        dom.output.authentication.output.classList.remove("is-invisible");
    } catch (e) {
        log.debug(e);
        console.error(e);

        dom.output.authentication.console.textContent = getErrorMessage(e);
        dom.output.authentication.output.classList.remove("is-invisible");
    }
}

function closeModal(event) {
    document.querySelector(".modal.is-active").classList.remove("is-active");
}

function showPasteModal(event, i) {
    dom.pasteModalInput.value = "";
    dom.pasteModal.classList.add("is-active");
}

function uploadExcludedCredentialsId(event, i) {
    const ec = excludedCredentials[i];

    ec.file.onchange = () => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const buf = Buffer.from(reader.result);
            const hex = buf.toString("hex");
            ec.id.textContent = hex.substr(0, 8) + "...";
            ec.id.value = hex;
        };

        reader.readAsArrayBuffer(ec.file.files[0]);
    };

    ec.file.click();
}

function uploadAllowedCredentialsId(event, i) {
    const ac = allowedCredentials[i];

    ac.file.onchange = () => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const buf = Buffer.from(reader.result);
            const hex = buf.toString("hex");
            ac.id.textContent = hex.substr(0, 8) + "...";
            ac.id.value = hex;
        };

        reader.readAsArrayBuffer(ac.file.files[0]);
    };

    ac.file.click();
}

function setupCheckboxes() {
    const cForm = dom.createForm;
    const gForm = dom.getForm;

    const checkboxes = [
        // Create
        [cForm.relyingParty.id.checkbox, [cForm.relyingParty.id.input]],
        [
            cForm.excludeCredentials.checkbox, [
                cForm.excludeCredentials.button,
                cForm.excludeCredentials.id.buttonBin,
                // cForm.excludeCredentials.id.buttonB64,
                cForm.excludeCredentials.type.checkbox,
                cForm.excludeCredentials.type.usbCheckbox,
                cForm.excludeCredentials.type.nfcCheckbox,
                cForm.excludeCredentials.type.bleCheckbox,
                cForm.excludeCredentials.type.internalCheckbox,
            ],
        ],
        [
            cForm.excludeCredentials.type.checkbox, [
                cForm.excludeCredentials.type.usbCheckbox,
                cForm.excludeCredentials.type.nfcCheckbox,
                cForm.excludeCredentials.type.bleCheckbox,
                cForm.excludeCredentials.type.internalCheckbox,
            ],
        ],
        [
            cForm.authenticatorSelection.checkbox, [
                cForm.authenticatorSelection.authenticatorAttachment.checkbox,
                cForm.authenticatorSelection.authenticatorAttachment.select,
                cForm.authenticatorSelection.residentKey.checkbox,
                cForm.authenticatorSelection.residentKey.select,
                cForm.authenticatorSelection.requireResidentKey.checkbox,
                cForm.authenticatorSelection.userVerification.checkbox,
                cForm.authenticatorSelection.userVerification.select,
            ],
        ],
        [
            cForm.authenticatorSelection.authenticatorAttachment.checkbox, [cForm.authenticatorSelection.authenticatorAttachment.select],
        ],
        [
            cForm.authenticatorSelection.residentKey.checkbox, [cForm.authenticatorSelection.residentKey.checkbox],
        ],        
        [
            cForm.authenticatorSelection.requireResidentKey.checkbox, [cForm.authenticatorSelection.requireResidentKey.checkbox],
        ],
        [
            cForm.authenticatorSelection.userVerification.checkbox, [cForm.authenticatorSelection.userVerification.select],
        ],
        [
            cForm.attestation.checkbox, [cForm.attestation.select]
        ],
        [
            cForm.extensions.checkbox, [
                cForm.extensions.credProps.checkbox,
                cForm.extensions.credProtectPolicy.checkbox,
                cForm.extensions.credProtectPolicy.select,
                cForm.extensions.credProtectEnforce.checkbox,
                cForm.extensions.minPinLength.checkbox,
                cForm.extensions.uvm.checkbox,
            ],
        ],

        // Get
        [gForm.rpId.checkbox, [gForm.rpId.input]],
        [gForm.userVerification.checkbox, [gForm.userVerification.select]],
        [gForm.mediation.checkbox, [gForm.mediation.select]],
        [gForm.extensions.checkbox, [gForm.extensions.uvm.checkbox]],
    ];

    function createCheckboxHandler(elements) {
        return (event) => {
            for (const e of elements) {
                e.disabled = !event.target.checked;
            }
        };
    }

    for (const checkbox of checkboxes) {
        const cbox = checkbox[0];
        const elements = checkbox[1];
        const handler = createCheckboxHandler(elements);

        handler({ target: cbox });

        cbox.addEventListener("input", handler);
    }

    dom.getForm.allowCredentials.checkbox.addEventListener(
        "input",
        allowCredentialsCheckboxHandler
    );
    allowedCredentials[0].type.checkbox.oninput = (e) => {
        return transportsCheckboxHandler(
            e,
            allowedCredentials[0].type.usb,
            allowedCredentials[0].type.nfc,
            allowedCredentials[0].type.ble,
            allowedCredentials[0].type.internal
        );
    };
}

function createRegenHandler(key, length) {
    globalOptions[key] = new Uint8Array(length);
    return () => {
        crypto.getRandomValues(globalOptions[key]);
    };
}

function showCBORUpload(event) {
    event.preventDefault();

    dom.output.uploadCBOR.click();
}

function uploadCBOR(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const buf = Buffer.from(reader.result);
        const credentials = cbor.decodeFirstSync(buf);
        handleCBORCredentials(credentials);
        dom.output.cbor.output.classList.remove("is-invisible");
    };
    reader.readAsArrayBuffer(file);
}

function downloadCBOR() {
    const creds = deepClone(lastCredentials);
    delete creds.getClientExtensionResults;
    delete creds.response.getTransports;
    const encoded = cborEncoder._encodeAll([creds]);
    log.debug(cbor.decodeFirstSync(encoded));
    saveAs(new Blob([encoded]), "output.cbor");
}

function downloadJSON() {
    const creds = deepClone(lastCredentials);
    delete creds.getClientExtensionResults;

    const transformations = deepClone(prettifyTransformations);
    transformations.x5c.transform = (data) => data.map(binToHex);

    transform(creds, transformations);

    const encoded = prettyStringify(creds);
    //log.debug(encoded);
    saveAs(new Blob([encoded]), "output.json");
}

function addPubKeyParam() {
    const selectId = `d-c-pubkey-alg-select-${pubKeyParams.length}`;
    const html = `
<div class="editor-label indent-2">{</div>
<div class="editor-label indent-3">type: 'public-key',</div>
<div class="form-row indent-3">
  <label id="d-c-pubkey-alg-line" class="label" for="d-c-pubkey-alg-select")>alg: </label>
  <div class="select-container">
    <select id="${selectId}" class="select">
      <option value="rs256">RS256 (RSASSA + SHA-256)</option>
      <option value="es256">ES256 (ECDSA P-256 + SHA-256)</option>
      <option value="es384" selected>ES384 (ECDSA P-384 + SHA-384)</option>
      <option value="es512">ES512 (ECDSA P-521 + SHA-512)</option>
      <option value="edDSA">EdDSA (Ed25519)</option>
    </select>
  </div>
</div>
<div class="editor-label indent-2">}</div>`;

    const cred = document.createElement("div");
    cred.innerHTML = html;
    cred.classList.add("editor-dynamic-item");
    dom.createForm.pubKeyCredParams.placeholder.parentElement.insertBefore(
        cred,
        dom.createForm.pubKeyCredParams.placeholder
    );

    const select = document.getElementById(selectId);
    pubKeyParams.push(select);
}

function allowCredentialsCheckboxHandler(event) {
    const disabled = !event.target.checked;

    dom.getForm.allowCredentials.button.disabled = disabled;

    for (const ac of allowedCredentials) {
        const elements = ac.id.parentElement.getElementsByTagName("*");
        const transportCboxes = [];

        for (const e of elements) {
            if (!disabled && e.id.includes("d-g-allow-creds-type-cbox")) {
                transportCboxes.push(e);
            }
            e.disabled = disabled;
        }

        transportCboxes.forEach((cbox) => cbox.oninput({ target: cbox }));
    }
}

function addExcludeCredential() {
    const i = excludedCredentials.length;
    const html = `<div class="editor-label indent-2">{</div>
    <div class="editor-label indent-3">type: 'public-key',</div>
    <div class="form-row indent-3">
      <label class="label" for="d-c-excl-creds-upload">id: <span id="d-c-excl-creds-id-line-${i}"></span></label>
      <input id="d-c-excl-creds-upload-${i}" type="file" style="display: none">
      <button class="button" id="d-c-upload-excl-creds-id-${i}">Upload (binary)</button>
    </div>
    <div class="form-row indent-3"><span class="checkbox-container position-outside">
        <input id="d-c-excl-creds-type-cbox-${i}" type="checkbox">
        <label class="checkbox" for="d-c-excl-creds-type-cbox-${i}"></label></span>
      <label class="label" id="d-c-excl-creds-type-cbox-${i}">transports: [ <span class="checkbox-container">      
          <input id="d-c-excl-creds-type-usb-${i}" type="checkbox" disabled="">
          <label class="checkbox" for="d-c-excl-creds-type-usb-${i}">USB</label></span><span class="checkbox-container">
          <input id="d-c-excl-creds-type-nfc-${i}" type="checkbox" disabled="">
          <label class="checkbox" for="d-c-excl-creds-type-nfc-${i}">NFC</label></span><span class="checkbox-container">
          <input id="d-c-excl-creds-type-ble-${i}" type="checkbox" disabled="">
          <label class="checkbox" for="d-c-excl-creds-type-ble-${i}">BLE</label></span></label>
          <input id="d-c-excl-creds-type-internal-${i}" type="checkbox" disabled="">
          <label class="checkbox" for="d-c-excl-creds-type-internal-${i}">Internal</label></span><span class="checkbox-container">]
    </div>
    <div class="editor-label indent-2">}</div>`;

    const cred = document.createElement("div");
    cred.innerHTML = html;
    cred.classList.add("editor-dynamic-item");

    dom.createForm.excludeCredentials.placeholder.parentElement.insertBefore(
        cred,
        dom.createForm.excludeCredentials.placeholder
    );

    const excludedCredential = {
        id: document.getElementById(`d-c-excl-creds-id-line-${i}`),
        upload: document.getElementById(`d-c-upload-excl-creds-id-${i}`),
        file: document.getElementById(`d-c-excl-creds-upload-${i}`),
        type: {
            checkbox: document.getElementById(`d-c-excl-creds-type-cbox-${i}`),
            usb: document.getElementById(`d-c-excl-creds-type-usb-${i}`),
            nfc: document.getElementById(`d-c-excl-creds-type-nfc-${i}`),
            ble: document.getElementById(`d-c-excl-creds-type-ble-${i}`),
            internal: document.getElementById(`d-c-excl-creds-type-internal-${i}`),
        },
    };

    excludedCredentials.push(excludedCredential);

    excludedCredential.type.checkbox.oninput = (e) => {
        return transportsCheckboxHandler(
            e,
            excludedCredential.type.usb,
            excludedCredential.type.nfc,
            excludedCredential.type.ble,
            excludedCredential.type.internal
        );
    };

    excludedCredential.upload.addEventListener("click", (e) =>
        uploadExcludedCredentialsId(e, i)
    );
}

function transportsCheckboxHandler(event, usb, nfc, ble, internal) {
    const disabled = !event.target.checked;

    usb.disabled = disabled;
    nfc.disabled = disabled;
    ble.disabled = disabled;
    internal.disabled = disabled;
}

function addAllowedCredential() {
    const i = allowedCredentials.length;
    const html = `<div class="editor-label indent-1">{</div>
    <div class="editor-label indent-2">type: 'public-key',</div>
      <div class="form-row indent-2">
        <label id="d-g-allow-creds-id-${i}" class="label">id: <span id="d-g-allow-creds-id"></span></label>
        <input id="d-g-upload-allow-creds-file-${i}" type="file" style="display: none" />
        <button id="d-g-upload-allow-creds-id-${i}" class="button">Upload (binary)</button>
      </div>
      <div class="form-row indent-2">
        <span class="checkbox-container position-outside">
          <input id="d-g-allow-creds-type-cbox-${i}" type="checkbox">
          <label class="checkbox" for="d-g-allow-creds-type-cbox-${i}"></label></span>
        <label class="label" id="d-c-excl-creds-type-cbox">transports: [ 
            <span class="checkbox-container">
                <input id="d-g-allow-creds-type-usb-${i}" type="checkbox" disabled="">
                <label class="checkbox" for="d-g-allow-creds-type-usb-${i}">USB</label>
            </span>
            <span class="checkbox-container">
                <input id="d-g-allow-creds-type-nfc-${i}" type="checkbox" disabled="">
                <label class="checkbox" for="d-g-allow-creds-type-nfc-${i}">NFC</label>
            </span>
            <span class="checkbox-container">
                <input id="d-g-allow-creds-type-ble-${i}" type="checkbox" disabled="">
                <label class="checkbox" for="d-g-allow-creds-type-ble-${i}">BLE</label>
            </span>
            <span class="checkbox-container">
                <input id="d-g-allow-creds-type-internal-${i}" type="checkbox" disabled="">
                <label class="checkbox" for="d-g-allow-creds-type-internal-${i}">INTERNAL</label>
            </span>
            ]
      </div>
      <div class="editor-label indent-1">}</div>`;

    const cred = document.createElement("div");
    cred.innerHTML = html;
    cred.classList.add("editor-dynamic-item");

    dom.getForm.allowCredentials.placeholder.parentElement.insertBefore(
        cred,
        dom.getForm.allowCredentials.placeholder
    );

    const allowedCredential = {
        id: document.getElementById(`d-g-allow-creds-id-${i}`),
        upload: document.getElementById(`d-g-upload-allow-creds-id-${i}`),
        file: document.getElementById(`d-g-upload-allow-creds-file-${i}`),
        paste: document.getElementById(`d-g-paste-base64-allow-creds-id-${i}`),
        type: {
            checkbox: document.getElementById(`d-g-allow-creds-type-cbox-${i}`),
            usb: document.getElementById(`d-g-allow-creds-type-usb-${i}`),
            nfc: document.getElementById(`d-g-allow-creds-type-nfc-${i}`),
            ble: document.getElementById(`d-g-allow-creds-type-ble-${i}`),
            internal: document.getElementById(`d-g-allow-creds-type-internal-${i}`)
        },
    };

    allowedCredentials.push(allowedCredential);

    allowedCredential.type.checkbox.oninput = (e) => {
        return transportsCheckboxHandler(
            e,
            allowedCredential.type.usb,
            allowedCredential.type.nfc,
            allowedCredential.type.ble,
            allowedCredential.type.internal
        );
    };

    // allowedCredential.paste.addEventListener("click", e => showPasteModal(e, i));
    allowedCredential.upload.addEventListener("click", (e) =>
        uploadAllowedCredentialsId(e, i)
    );
}

function setupEvents() {
    dom.registerButton.addEventListener("click", register);
    dom.authenticateButton.addEventListener("click", authenticate);

    dom.output.keyModal.closeButton.addEventListener("click", closeModal);
    dom.pasteModalOkButton.addEventListener("click", closeModal);

    // dom.getForm.allowCredentials.id.paste.addEventListener("click", e =>
    //   showPasteModal(e, 0)
    // );

    dom.createForm.excludeCredentials.id.buttonBin.addEventListener(
        "click",
        (e) => uploadExcludedCredentialsId(e, 0)
    );
    dom.getForm.allowCredentials.id.upload.addEventListener("click", (e) =>
        uploadAllowedCredentialsId(e, 0)
    );

    const userIdRegenHandler = createRegenHandler("userId", 32);
    userIdRegenHandler();
    const challengeRegenHandler = createRegenHandler("challenge", 32);
    challengeRegenHandler();

    dom.createForm.user.id.button.addEventListener("click", userIdRegenHandler);
    dom.createForm.challenge.button.addEventListener(
        "click",
        challengeRegenHandler
    );
    dom.getForm.challenge.button.addEventListener("click", challengeRegenHandler);

    dom.createForm.pubKeyCredParams.button.addEventListener(
        "click",
        addPubKeyParam
    );
    dom.createForm.excludeCredentials.button.addEventListener(
        "click",
        addExcludeCredential
    );

    dom.getForm.allowCredentials.button.addEventListener(
        "click",
        addAllowedCredential
    );

    dom.output.triggerUploadCBOR.addEventListener("click", showCBORUpload);
    dom.output.uploadCBOR.addEventListener("change", uploadCBOR);
    dom.output.downloadCBOR.forEach((button) =>
        button.addEventListener("click", downloadCBOR)
    );
    dom.output.downloadJSON.forEach((button) =>
        button.addEventListener("click", downloadJSON)
    );

    setupCheckboxes();
}

function setupAuthenticatorsListInterval() {
    async function checkAvailableAuthenticators() {
        const indicator = dom.availableIndicators;
        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (available) {
                indicator.forEach((ind) => ind.classList.add("hidden"));
            }
        } catch (e) {
            log.debug("isUserVerifyingPlatformAuthenticatorAvailable(): ", e);
        }
    }

    checkAvailableAuthenticators();
    setInterval(checkAvailableAuthenticators, 2000);
}

function setupTooltips() {
    const lines = document.querySelectorAll("#debugger-code-create pre span");

    for (const line of lines) {
        line.setAttribute(
            "title",
            "[TODO] this tooltip describes what this key means"
        );
        tippy(line, {
            placement: "right",
        });
    }
}

function initConfigFields() {
    const rpId = document.location.origin;

    dom.createForm.relyingParty.id.input.value = rpId;
    dom.getForm.rpId.input.value = rpId;
}

export function setupDebugger() {
    setupAuthenticatorsListInterval();
    initConfigFields();
    setupEvents();
    setupTooltips();
}