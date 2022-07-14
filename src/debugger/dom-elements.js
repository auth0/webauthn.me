// Create
export const createForm = {
    relyingParty: {
        id: {
            line: document.getElementById("d-c-rp-id-line"),
            checkbox: document.getElementById("d-c-rp-id-cbox"),
            input: document.getElementById("d-c-rp-id"),
        },
        name: {
            line: document.getElementById("d-c-rp-name-line"),
            input: document.getElementById("d-c-rp-name"),
        },
    },
    user: {
        id: {
            line: document.getElementById("d-c-user-id-line"),
            button: document.getElementById("d-c-regen-uid"),
        },
        name: {
            line: document.getElementById("d-c-user-name-line"),
            input: document.getElementById("d-c-user-name"),
        },
        displayName: {
            line: document.getElementById("d-c-user-dp-line"),
            input: document.getElementById("d-c-user-dpname"),
        },
    },
    challenge: {
        line: document.getElementById("d-c-challenge-line"),
        button: document.getElementById("d-c-regen-challenge"),
    },
    pubKeyCredParams: {
        button: document.getElementById("d-c-add-pubkey-params"),
        algos: [
            {
                line: document.getElementById("d-c-pubkey-alg-line"),
                select: document.getElementById("d-c-pubkey-alg-select"),
            },
            {
                line: document.getElementById("d-c-pubkey-alg-line-1"),
                select: document.getElementById("d-c-pubkey-alg-select-1"),
            }            
        ],
        placeholder: document.getElementById("d-c-add-pubkey-params-placeholder"),
    },
    timeout: {
        line: document.getElementById("d-c-timeout-line"),
        input: document.getElementById("d-c-timeout"),
    },
    excludeCredentials: {
        checkbox: document.getElementById("d-c-excl-creds-cbox"),
        button: document.getElementById("d-c-add-excl-creds"),
        file: document.getElementById("d-c-excl-creds-upload"),
        placeholder: document.getElementById("d-c-excl-creds-placeholder"),
        id: {
            line: document.getElementById("d-c-excl-creds-id-line"),
            buttonBin: document.getElementById("d-c-upload-excl-creds-id"),
            buttonB64: document.getElementById("d-c-upload-base64-excl-creds-id"),
        },
        type: {
            line: document.getElementById("d-c-excl-creds-type-line"),
            checkbox: document.getElementById("d-c-excl-creds-type-cbox"),
            usbCheckbox: document.getElementById("d-c-excl-creds-type-usb"),
            nfcCheckbox: document.getElementById("d-c-excl-creds-type-nfc"),
            bleCheckbox: document.getElementById("d-c-excl-creds-type-ble"),
            internalCheckbox: document.getElementById("d-c-excl-creds-type-internal"),
        },
    },
    authenticatorSelection: {
        checkbox: document.getElementById("d-c-auth-sel-cbox"),
        authenticatorAttachment: {
            line: document.getElementById("d-c-auth-attach-line"),
            checkbox: document.getElementById("d-c-auth-attach-cbox"),
            select: document.getElementById("d-c-auth-attach-select"),
        },
        residentKey: {
            line: document.getElementById("d-c-res-key-line"),
            checkbox: document.getElementById("d-c-res-key-cbox"),
            select: document.getElementById("d-c-res-key-select"),
        },        
        requireResidentKey: {
            line: document.getElementById("d-c-req-res-key-line"),
            checkbox: document.getElementById("d-c-req-res-key-cbox-val"),
        },
        userVerification: {
            line: document.getElementById("d-c-user-verif-line"),
            checkbox: document.getElementById("d-c-user-verif-cbox"),
            select: document.getElementById("d-c-user-verif-select"),
        },
    },
    attestation: {
        line: document.getElementById("d-c-attest-line"),
        checkbox: document.getElementById("d-c-attest-cbox"),
        select: document.getElementById("d-c-attest-select"),
    },
    extensions: {
        checkbox: document.getElementById("d-c-extensions-cbox"),
        credProps: {
            line: document.getElementById("d-c-cred-props-line"),
            checkbox: document.getElementById("d-c-cred-props-cbox-val"),
        },
        credProtectPolicy: {
            line: document.getElementById("d-c-cred-protect-policy-line"),
            checkbox: document.getElementById("d-c-cred-protect-policy-cbox"),
            select: document.getElementById("d-c-cred-protect-policy-select"),
        },
        credProtectEnforce: {
            line: document.getElementById("d-c-cred-protect-enforce-line"),
            checkbox: document.getElementById("d-c-cred-protect-enforce-cbox-val"),
        },
        minPinLength: {
            line: document.getElementById("d-c-min-pin-length-line"),
            checkbox: document.getElementById("d-c-min-pin-length-cbox-val"),
        },
        uvm: {
            line: document.getElementById("d-c-uvm-line"),
            checkbox: document.getElementById("d-c-uvm-cbox-val"),
        }
    },    
};

// Get
export const getForm = {
    challenge: {
        line: document.getElementById("d-g-challenge-line"),
        button: document.getElementById("d-g-regen-challenge"),
    },
    timeout: {
        line: document.getElementById("d-g-timeout-line"),
        input: document.getElementById("d-g-timeout"),
    },
    rpId: {
        line: document.getElementById("d-g-rp-id-line"),
        checkbox: document.getElementById("d-g-rp-id-cbox"),
        input: document.getElementById("d-g-rp-id"),
    },
    allowCredentials: {
        checkbox: document.getElementById("d-g-allow-creds-cbox"),
        button: document.getElementById("d-g-add-allow-creds"),
        id: {
            line: document.getElementById("d-g-allow-creds-id-line"),
            span: document.getElementById("d-g-allow-creds-id"),
            upload: document.getElementById("d-g-upload-allow-creds-id"),
            file: document.getElementById("d-g-upload-allow-creds-file"),
            paste: document.getElementById("d-g-paste-base64-allow-creds-id"),
        },
        type: {
            line: document.getElementById("d-g-allow-creds-type-line"),
            checkbox: document.getElementById("d-g-allow-creds-type-cbox"),
            usbCheckbox: document.getElementById("d-g-allow-creds-type-usb"),
            nfcCheckbox: document.getElementById("d-g-allow-creds-type-nfc"),
            bleCheckbox: document.getElementById("d-g-allow-creds-type-ble"),
            internalCheckbox: document.getElementById("d-g-allow-creds-type-internal"),
        },
        placeholder: document.getElementById("d-g-allow-creds-placeholder"),
    },
    userVerification: {
        line: document.getElementById("d-g-user-verif-line"),
        checkbox: document.getElementById("d-g-user-verif-cbox"),
        select: document.getElementById("d-g-user-verif-select"),
    },
    mediation: {
        line: document.getElementById("d-g-mediation-line"),
        checkbox: document.getElementById("d-g-mediation-cbox"),
        select: document.getElementById("d-g-mediation-select"),
    },
    extensions: {
        checkbox: document.getElementById("d-g-extensions-cbox"),
        uvm: {
            line: document.getElementById("d-g-uvm-line"),
            checkbox: document.getElementById("d-g-uvm-cbox-val"),
        }
    },
};

// Other elements
export const registerButton = document.getElementById(
    "debugger-register-button"
);

export const authenticateButton = document.getElementById(
    "debugger-authenticate-button"
);

export const availableIndicators = document.querySelectorAll(
    "#debugger-auth-available-indicator"
);

export const output = {
    triggerUploadCBOR: document.getElementById(
        "debugger-output-upload-cbor-trigger"
    ),
    uploadCBOR: document.getElementById("debugger-output-upload-cbor"),
    downloadCBOR: document.querySelectorAll("#debugger-output-download-cbor"),
    downloadJSON: document.querySelectorAll("#debugger-output-download-json"),
    keyModal: {
        modal: document.getElementById("debugger-key-modal"),
        closeButton: document.getElementById("debugger-key-modal-close-button"),
        pre: document.getElementById("debugger-key-modal-key"),
    },
    registration: {
        output: document.getElementById("debugger-register-output"),
        console: document.getElementById("debugger-register-output-console"),
        rawId: document.getElementById("register-output-rawid"),
        publicKey: document.getElementById("register-output-public-key"),
    },
    authentication: {
        output: document.getElementById("debugger-authenticate-output"),
        console: document.getElementById("debugger-authenticate-output-console"),
        signature: document.getElementById("authenticate-output-signature"),
        challenge: document.getElementById("authenticate-output-challenge"),
    },
    cbor: {
        output: document.getElementById("debugger-cbor-output"),
        console: document.getElementById("debugger-cbor-output-console"),
        rawId: document.getElementById("cbor-output-rawid"),
        publicKey: document.getElementById("cbor-output-public-key"),
    },
    userPresenceWarning: document.querySelector(".output-up-warning"),
};

export const pasteModal = document.getElementById("debugger-paste-modal");

export const pasteModalCloseButton = document.getElementById(
    "debugger-paste-modal-close-button"
);

export const pasteModalOkButton = document.getElementById(
    "debugger-paste-modal-button-ok"
);

export const pasteModalInput = document.getElementById(
    "debugger-paste-modal-input"
);