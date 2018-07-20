import * as dom from './dom-elements.js';
import strings from './strings.js';

import {
  deepClone,
  findKey,
  derToPem,
  x5cArrayToCertInfo,
  prettyStringify,
  cborEncoder,
  getErrorMessage,
  getSelectValue,
  transform
} from './utils.js';

import { prettifyTransformations, binToHex } from './transformations.js';

import {
  parseCredentials,
  prettifyCredentials,
  prettyCredentialsWithHtml
} from './output-parser.js';

import log from 'loglevel';
import cbor from 'cbor';
import { saveAs } from 'file-saver';
import coseToJwk from 'cose-to-jwk';
import tippy from 'tippy.js';
import jkwToPem from 'jwk-to-pem';

let lastCredentials;
let lastCredentialsParsed;

const pubKeyParams = [
  dom.createForm.pubKeyCredParams.alg.select
];

const allowedCredentials = [{
  id: dom.getForm.allowCredentials.id.span,
  upload: dom.getForm.allowCredentials.id.upload,
  file: dom.getForm.allowCredentials.id.file,
  paste: dom.getForm.allowCredentials.id.paste,
  type: {
    checkbox: dom.getForm.allowCredentials.type.checkbox,
    usb: dom.getForm.allowCredentials.type.usbCheckbox,
    nfc: dom.getForm.allowCredentials.type.nfcCheckbox,
    ble: dom.getForm.allowCredentials.type.bleCheckbox
  }
}];

const options = {
  challenge: new Uint8Array(32),
  userId: new Uint8Array(32)
};

function getAlgValueFromSelect(select) {
  // TODO: add other algs
  const values = {
    es256: -7,
    rs256: -257
  }
  return values[select.options[select.selectedIndex].value];
}

window.outputButtonClick = function outputButtonClick(event) {
  const key = event.target.dataset.key;
  if(!key) {
    log.error('Missing key for output button? Event: ', event);
    return;
  }

  const value = findKey(lastCredentialsParsed, key);
  const text = event.target.firstChild.textContent.toLowerCase();

  if(text.includes('view')) {
    const modalText = x5cArrayToCertInfo(value);
    dom.output.keyModal.pre.textContent = modalText;
    dom.output.keyModal.modal.classList.add('is-active');
  } else if(text.includes('download')) {
    switch(key) {
      case 'rawId':
        saveAs(new Blob([value]), 'rawId.bin');
        break;
      case 'sig':
      case 'signature':
        saveAs(new Blob([value]), `${key}.bin`);
        break;
      case 'x5c':
        if(text.includes('pem')) {
          const pems = value.map(derToPem);
          const joined = pems.join('\r\n');
          saveAs(new Blob([joined]), 'x5c.pem');
        }
        break;
      case 'credentialPublicKey':
        if(text.includes('jwk')) {
          saveAs(new Blob([
            prettyStringify(coseToJwk(value))
          ]), 'credentialPublicKey.jwk');
        } else if(text.includes('pem')) {
          saveAs(new Blob([
            jkwToPem(coseToJwk(value))
          ]), 'credentialPublicKey.pem');
        } else if(text.includes('cose')) {
          saveAs(new Blob([value]), 'credentialPublicKey.cose');
        }
        break;
    }
  }
}

function getCreateOptions() {
  const cForm = dom.createForm;

  const publicKey = {
    rp: {
      name: cForm.relyingParty.name.input.value
    },
    user: {
      id: options.userId,
      name: cForm.user.name.input.value,
      displayName: cForm.user.displayName.input.value
    },
    challenge: options.challenge,
    pubKeyCredParams: pubKeyParams.map(select => ({
      type: 'public-key',
      alg: getAlgValueFromSelect(select)
    })),
    timeout: cForm.timeout.input.value
  };

  //TODO: excludeCredentials

  if(cForm.authenticatorSelect.checkbox.checked) {
    const authenticatorSelect = {};

    if(cForm.authenticatorSelect.authenticatorAttachment.checkbox.checked) {
      authenticatorSelect.authenticatorAttachment =
        getSelectValue(
          cForm.authenticatorSelect.authenticatorAttachment.select);
    }

    if(cForm.authenticatorSelect.requireResidentKey.checkbox.checked) {
      authenticatorSelect.requireResidentKey =
        cForm.authenticatorSelect.requireResidentKey.input.checked;
    }

    if(cForm.authenticatorSelect.userVerification.checkbox.checked) {
      authenticatorSelect.userVerification =
        getSelectValue(
          cForm.authenticatorSelect.userVerification.select);
    }

    publicKey.authenticatorSelect = authenticatorSelect;
  }

  if(dom.createForm.attestation.checkbox.checked) {
    publicKey.attestation = getSelectValue(dom.createForm.attestation.select);
  }

  return {
    publicKey: publicKey
  };
}

function handleCredentials(credentials) {
  lastCredentials = deepClone(credentials);
  lastCredentialsParsed = parseCredentials(credentials);

  const prettyCredentials = prettifyCredentials(credentials);
  const withHtml = prettyCredentialsWithHtml(prettyCredentials);

  log.debug(prettyCredentials);
  log.debug(withHtml);

  dom.output.console.innerHTML = withHtml;
}

function useLastRawId(rawId) {
  let last = allowedCredentials.length - 1;
  if(allowedCredentials[last].id.textContent.length !== 0) {
    addAllowedCredential();
    ++last;
  }

  const ac = allowedCredentials[last];
  ac.id.textContent = rawId.substr(0, 8) + '...';
  ac.id.value = rawId;
}

async function register() {
  try {
    const credentials = await navigator.credentials.create(getCreateOptions());
    handleCredentials(credentials);

    useLastRawId(binToHex(credentials.rawId));
  } catch(e) {
    log.debug(e);

    dom.output.console.textContent = getErrorMessage(e);
  }
}

function getGetOptions() {
  const gForm = dom.getForm;

  const publicKey = {
    challenge: options.challenge,
    timeout: gForm.timeout.input.value
  };

  if(gForm.rpId.checkbox.checked) {
    publicKey.rpId = gForm.rpId.input.value;
  }

  // TODO: handle multiple credentials
  if(gForm.allowCredentials.checkbox.checked) {
    publicKey.allowCredentials = allowedCredentials.map(ac => {
      const result = {
        type: 'public-key',
        id: Buffer.from(ac.id.value, 'hex')
      };

      if(ac.type.checkbox.checked) {
        result.transports = [];
        if(ac.type.usb.checked) {
          result.transports.push('usb');
        }
        if(ac.type.nfc.checked) {
          result.transports.push('nfc');
        }
        if(ac.type.ble.checked) {
          result.transports.push('ble');
        }
      }

      return result;
    });
  }

  if(gForm.userVerification.checkbox.checked) {
    publicKey.userVerification = getSelectValue(gForm.userVerification.select);
  }

  const result = {
    publicKey: publicKey
  };

  if(gForm.mediation.checkbox.checked) {
    result.mediation = getSelectValue(gForm.mediation.select);
  }

  return result;
}

async function authenticate() {
  try {
    const credentials = await navigator.credentials.get(getGetOptions());
    handleCredentials(credentials);
  } catch(e) {
    log.debug(e);

    dom.output.console.textContent = getErrorMessage(e);
  }
}

function closeModal(event) {
  document.querySelector('.modal.is-active').classList.remove('is-active');
}

function showPasteModal(event, i) {
  dom.pasteModalInput.value = '';
  dom.pasteModal.classList.add('is-active');
}

function uploadAllowedCredentialsId(event, i) {
  const ac = allowedCredentials[i];

  ac.file.onchange = () => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const buf = Buffer.from(reader.result);
      const hex = buf.toString('hex');
      ac.id.textContent = hex.substr(0, 8) + '...';
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
    [cForm.excludeCredentials.checkbox, [
      cForm.excludeCredentials.button,
      cForm.excludeCredentials.id.buttonBin,
      cForm.excludeCredentials.id.buttonB64,
      cForm.excludeCredentials.type.checkbox,
      cForm.excludeCredentials.type.usbCheckbox,
      cForm.excludeCredentials.type.nfcCheckbox,
      cForm.excludeCredentials.type.bleCheckbox
    ]],
    [cForm.excludeCredentials.type.checkbox, [
      cForm.excludeCredentials.type.usbCheckbox,
      cForm.excludeCredentials.type.nfcCheckbox,
      cForm.excludeCredentials.type.bleCheckbox
    ]],
    [cForm.authenticatorSelect.checkbox, [
      cForm.authenticatorSelect.authenticatorAttachment.checkbox,
      cForm.authenticatorSelect.authenticatorAttachment.select,
      cForm.authenticatorSelect.requireResidentKey.checkbox,
      cForm.authenticatorSelect.requireResidentKey.input,
      cForm.authenticatorSelect.userVerification.checkbox,
      cForm.authenticatorSelect.userVerification.select,
    ]],
    [cForm.authenticatorSelect.authenticatorAttachment.checkbox, [
      cForm.authenticatorSelect.authenticatorAttachment.select
    ]],
    [cForm.authenticatorSelect.requireResidentKey.checkbox, [
      cForm.authenticatorSelect.requireResidentKey.input
    ]],
    [cForm.authenticatorSelect.userVerification.checkbox, [
      cForm.authenticatorSelect.userVerification.select
    ]],
    [cForm.attestation.checkbox, [
      cForm.attestation.select
    ]],

    // Get
    [gForm.rpId.checkbox, [gForm.rpId.input]],
    [gForm.userVerification.checkbox, [gForm.userVerification.select]],
    [gForm.mediation.checkbox, [gForm.mediation.select]]
  ];

  function createCheckboxHandler(elements) {
    return event => {
      for(const e of elements) {
        e.disabled = !event.target.checked;
      }
    };
  }

  for(const checkbox of checkboxes) {
    const cbox = checkbox[0];
    const elements = checkbox[1];
    const handler = createCheckboxHandler(elements);

    handler({ target: cbox });

    cbox.addEventListener('input', handler);
  }

  dom.getForm.allowCredentials.checkbox
     .addEventListener('input', allowCredentialsCheckboxHandler);

  allowedCredentials[0].type.checkbox.oninput = e => {
  return allowCredentialsTypeCheckboxHandler(e,
    allowedCredentials[0].type.usb,
    allowedCredentials[0].type.nfc,
    allowedCredentials[0].type.ble);
  };
}

function createRegenHandler(key, length) {
  options[key] = new Uint8Array(length);
  return () => {
    crypto.getRandomValues(options[key]);
  };
}

function uploadCBOR(event) {
  const file = event.target.files[0];
  if(!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const buf = Buffer.from(reader.result);
    const credentials = cbor.decodeFirstSync(buf);
    handleCredentials(credentials);
  };
  reader.readAsArrayBuffer(file);
}

function downloadCBOR() {
  const creds = deepClone(lastCredentials);
  delete creds.getClientExtensionResults;
  const encoded = cborEncoder._encodeAll([creds]);
  //log.debug(cbor.decodeFirstSync(encoded));
  saveAs(new Blob([encoded]), 'output.cbor');
}

function downloadJSON() {
  const creds = deepClone(lastCredentials);
  delete creds.getClientExtensionResults;

  const transformations = deepClone(prettifyTransformations);
  transformations.x5c.transform = data => data.map(binToHex);

  transform(creds, transformations);

  const encoded = prettyStringify(creds);
  //log.debug(encoded);
  saveAs(new Blob([encoded]), 'output.json');
}

function addPubKeyParam() {
  const selectId = `d-c-pubkey-alg-select-${pubKeyParams.length}`;
  const html =
`, {
        type: 'public-key',
        <span id="d-c-pubkey-alg-line">alg: <select id="${selectId}">
            <option value="es256" selected>ES256 (ECDSA P-256 + SHA-256)</option>
            <option value="rs256">RS256 (RSASSA + SHA-256)</option>
          </select></span>
      }`;

  const span = document.createElement('span');
  span.innerHTML = html;
  dom.createForm.pubKeyCredParams.placeholder.parentElement
     .insertBefore(span, dom.createForm.pubKeyCredParams.placeholder);

  const select = document.getElementById(selectId);
  pubKeyParams.push(select);
}

function allowCredentialsCheckboxHandler(event) {
  const disabled = !event.target.checked;

  dom.getForm.allowCredentials.button.disabled = disabled;

  for(const ac of allowedCredentials) {
    const elements = ac.id.parentElement.getElementsByTagName('*');
    const transportCboxes = [];

    for(const e of elements) {
      if(!disabled && e.id.includes('d-g-allow-creds-type-cbox')) {
        transportCboxes.push(e);
      }
      e.disabled = disabled;
    }

    transportCboxes.forEach(cbox => cbox.oninput({ target: cbox }));
  }
}

function allowCredentialsTypeCheckboxHandler(event, usb, nfc, ble) {
  const disabled = !event.target.checked;

  usb.disabled = disabled;
  nfc.disabled = disabled;
  ble.disabled = disabled;
}

function addAllowedCredential() {
  const i = allowedCredentials.length;
  const html =
`, {
        type: 'public-key',
        id: <span id="d-g-allow-creds-id-${i}"></span><input type="file" id="d-g-upload-allow-creds-file-${i}" style="display: none"><button id="d-g-upload-allow-creds-id-${i}">Upload (binary)</button><button id="d-g-paste-base64-allow-creds-id-${i}">Paste (Base64)</button>,
        <input id="d-g-allow-creds-type-cbox-${i}" type="checkbox"> transports: <input id="d-g-allow-creds-type-usb-${i}" type="checkbox" disabled> 'usb' <input id="d-g-allow-creds-type-nfc-${i}" type="checkbox" disabled> 'nfc' <input id="d-g-allow-creds-type-ble-${i}" type="checkbox" disabled> 'ble'
      }`;

  const span = document.createElement('span');
  span.innerHTML = html;

  dom.getForm.allowCredentials.placeholder.parentElement
     .insertBefore(span, dom.getForm.allowCredentials.placeholder);

  const allowedCredential = {
    id: document.getElementById(`d-g-allow-creds-id-${i}`),
    upload: document.getElementById(`d-g-upload-allow-creds-id-${i}`),
    file: document.getElementById(`d-g-upload-allow-creds-file-${i}`),
    paste: document.getElementById(`d-g-paste-base64-allow-creds-id-${i}`),
    type: {
      checkbox: document.getElementById(`d-g-allow-creds-type-cbox-${i}`),
      usb: document.getElementById(`d-g-allow-creds-type-usb-${i}`),
      nfc: document.getElementById(`d-g-allow-creds-type-nfc-${i}`),
      ble: document.getElementById(`d-g-allow-creds-type-ble-${i}`)
    }
  };

  allowedCredentials.push(allowedCredential);

  allowedCredential.type.checkbox.oninput = e => {
    return allowCredentialsTypeCheckboxHandler(e,
      allowedCredential.type.usb,
      allowedCredential.type.nfc,
      allowedCredential.type.ble);
  };

  allowedCredential.paste
     .addEventListener('click', e => showPasteModal(e, i));
  allowedCredential.upload
     .addEventListener('click', e => uploadAllowedCredentialsId(e, i));
}

function setupEvents() {
  dom.registerButton.addEventListener('click', register);
  dom.authenticateButton.addEventListener('click', authenticate);

  dom.output.keyModal.closeButton.addEventListener('click', closeModal);
  dom.pasteModalCloseButton.addEventListener('click', closeModal);
  dom.pasteModalOkButton.addEventListener('click', closeModal);

  dom.getForm.allowCredentials.id.paste
     .addEventListener('click', e => showPasteModal(e, 0));
  dom.getForm.allowCredentials.id.upload
     .addEventListener('click', e => uploadAllowedCredentialsId(e, 0));

  const userIdRegenHandler = createRegenHandler('userId', 32);
  userIdRegenHandler();
  const challengeRegenHandler = createRegenHandler('challenge', 32);
  challengeRegenHandler();

  dom.createForm.user.id.button.addEventListener('click', userIdRegenHandler);
  dom.createForm.challenge.button.addEventListener('click',
    challengeRegenHandler);
  dom.getForm.challenge.button.addEventListener('click', challengeRegenHandler);

  dom.createForm.pubKeyCredParams.button
     .addEventListener('click', addPubKeyParam);

  dom.getForm.allowCredentials.button
     .addEventListener('click', addAllowedCredential);

  dom.output.uploadCBOR.addEventListener('change', uploadCBOR);
  dom.output.downloadCBOR.addEventListener('click', downloadCBOR);
  dom.output.downloadJSON.addEventListener('click', downloadJSON);

  setupCheckboxes();
}

function setupAuthenticatorsListInterval() {
  async function checkAvailableAuthenticators() {
    const indicator = dom.availableIndicatorSpan;
    try {
      const available = await PublicKeyCredential.
                              isUserVerifyingPlatformAuthenticatorAvailable();
      if(available) {
        indicator.textContent = strings.authenticatorAvailable;
        indicator.classList.remove('is-danger');
        indicator.classList.add('is-success');
      } else {
        indicator.textContent = strings.authenticatorNotAvailable;
        indicator.classList.add('is-danger');
        indicator.classList.remove('is-success');
      }
    } catch(e) {
      log.debug('isUserVerifyingPlatformAuthenticatorAvailable(): ', e);

      indicator.textContent = strings.authenticatorAvailableNotSupported;
      indicator.classList.add('is-danger');
      indicator.classList.remove('is-success');
    }
  }

  checkAvailableAuthenticators();
  setInterval(checkAvailableAuthenticators, 2000);
}

function setupTooltips() {
  const lines = document.querySelectorAll('#debugger-code-create pre span');

  for(const line of lines) {
    line.setAttribute('title',
      '[TODO] this tooltip describes what this key means');
    tippy(line, {
      placement: 'right'
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
