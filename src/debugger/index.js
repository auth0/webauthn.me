import * as dom from './dom-elements.js';
import strings from './strings.js';
import { deepClone, objectSlice, findKey, findAllKeys } from './utils.js';

import log from 'loglevel';
import cbor from 'cbor';
import { saveAs } from 'file-saver';
import coseToJwk from 'cose-to-jwk';
import tippy from 'tippy.js';
//import { asn1, util, pki, pkcs12 } from 'node-forge';
import { fromBER } from 'asn1js';
import { Certificate } from 'pkijs';

// TODO: temporary
let lastCredentials;
let lastCredentialsParsed;

function getErrorMessage(e) {
  if(e instanceof Error) {
    return e.toString();
  }

  return JSON.stringify(e, null, 2);
}

function getSelectValue(select) {
  return select.options[select.selectedIndex].value;
}

function getAlgValueFromSelect(select) {
  // TODO
  return -7;
}

function prettyStringify(object) {
  return JSON.stringify(object, null, 2);
}

function parseAuthenticatorData(data) {
  const d = data instanceof ArrayBuffer ?
    new DataView(data) :
    new DataView(data.buffer, data.byteOffset, data.byteLength)
  let p = 0;

  const result = {};

  result.rpIdHash = '';
  for(const end = p + 32; p < end; ++p) {
    result.rpIdHash += d.getUint8(p).toString(16);
  }

  const flags = d.getUint8(p++);
  result.flags = {
    userPresent: (flags & 0x01) !== 0,
    reserved1: (flags & 0x02) !== 0,
    userVerified: (flags & 0x04) !== 0,
    reserved2: ((flags & 0x38) >>> 3).toString(16),
    attestedCredentialData: (flags & 0x40) !== 0,
    extensionDataIncluded: (flags & 0x80) !== 0
  };

  result.signCount = d.getUint32(p, false);
  p += 4;

  if(result.flags.attestedCredentialData) {
    const atCredData = {};
    result.attestedCredentialData = atCredData;

    atCredData.aaguid = '';
    for(const end = p + 16; p < end; ++p) {
      atCredData.aaguid += d.getUint8(p).toString(16);
    }

    atCredData.credentialIdLength = d.getUint16(p, false);
    p += 2;

    atCredData.credentialId = '';
    for(const end = p + atCredData.credentialIdLength; p < end; ++p) {
      atCredData.credentialId += d.getUint8(p).toString(16);
    }

    try {
      const encodedCred = Buffer.from(d.buffer, d.byteOffset + p);
      atCredData.credentialPublicKey =
        cbor.encode(cbor.decodeFirstSync(encodedCred));
    } catch(e) {
      log.error('Failed to decode CBOR data: ', e);

      atCredData.credentialPublicKey = `Decode error: ${e.toString()}`
    }
  }

  if(result.flags.extensionDataIncluded) {
    // TODO
  }

  return result;
}

function parseAttestationObject(data) {
  const buffer = data instanceof ArrayBuffer ?
    Buffer.from(data) :
    Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  try {
    const decoded = cbor.decodeFirstSync(buffer);

    if(decoded.authData) {
      //saveAs(new Blob([decoded.authData]), 'authData.bin');
      decoded.authData = parseAuthenticatorData(decoded.authData);
    }

    return decoded;
  } catch(e) {
    const msg = 'Failed to decode attestationObject, unknown attestation type?';
    log.error(msg);
    return msg;
  }
}

function binToHex(data) {
  if(!(data instanceof Buffer)) {
    data = Buffer.from(data);
  }

  return data.toString('hex');
}

function parseClientDataJSON(data) {
  const decoder = new TextDecoder('utf-8');
  const decoded = decoder.decode(data);
  return JSON.parse(decoded);
}

const prettifyTransformations = {
  rawId: {
    transform: binToHex,
    buttons: ['Download']
  },
  sig: {
    transform: binToHex,
    buttons: ['Download']
  },
  signature: {
    transform: binToHex,
    buttons: ['Download']
  },
  userHandle: {
    transform: binToHex,
    buttons: ['Download']
  },
  x5c: {
    transform: arr => arr.map(() => '[Big Binary]'),
    buttons: ['View', 'Download PEM', 'Download DER']
  },
  credentialPublicKey: {
    transform: coseToJwk,
    buttons: ['Download COSE', 'Download JWK', 'Download PEM', 'Download DER']
  },
  authenticatorData: {
    transform: parseAuthenticatorData
  },
  attestationObject: {
    transform: parseAttestationObject
  },
  clientDataJSON: {
    transform: parseClientDataJSON
  }
};

// Transform special keys
function transform(object, transformations) {
  Object.keys(object).forEach(key => {
    if(key in transformations) {
      object[key] = transformations[key].transform(object[key]);
    }

    if(typeof object[key] === 'object') {
      transform(object[key], transformations);
    }
  });
}

function parseCredentials(credentials) {
  const result = deepClone(credentials);
  const transformations = objectSlice(prettifyTransformations, [
    'clientDataJSON',
    'authenticatorData',
    'attestationObject'
  ]);
  transform(result, transformations);
  return result;
}

function prettifyCredentials(credentials) {
  const creds = deepClone(credentials);
  transform(creds, prettifyTransformations);
  return prettyStringify(creds);
}

window.outputButtonClick = function outputButtonClick(event) {
  const key = event.target.dataset.key;
  if(!key) {
    log.error('Missing key for output button? Event: ', event);
    return;
  }

  const value = findKey(lastCredentialsParsed, key);

  let modalText;
  switch(key) {
    case 'x5c':
      switch(event.target.firstChild.textContent.toLowerCase()) {
        case 'view':
          const buffer = value[0].buffer.slice(value[0].byteOffset,
            value[0].byteOffset + value[0].byteLength);
          const parsed = fromBER(buffer);
          const cert = new Certificate({ schema: parsed.result });
          modalText = prettyStringify(cert);
      }
      break;
  }

  dom.outputKeyModalPre.textContent = modalText;
  dom.outputKeyModal.classList.add('is-active');
}

function prettyCredentialsWithHtml(prettyCredentials) {
  let lines = prettyCredentials.split('\n');

  lines = lines.map(line => {
    for(const key of Object.keys(prettifyTransformations)) {
      const keyStr = `"${key}": `;
      const idx = line.indexOf(keyStr);
      if(idx !== -1 && prettifyTransformations[key].buttons) {
        const pos = idx + keyStr.length;

        const head = line.substring(0, pos);
        const tail = line.substring(pos);

        let buttons = '';
        for(const but of prettifyTransformations[key].buttons) {
          buttons +=
            `<button data-key="${key}" onclick="outputButtonClick(event);">` +
            `${but}</button>`;
        }
        line = `${head}${buttons}${tail}`;
      }
    }
    return line;
  });

  return lines.join('\n');
}

function getCreateOptions() {
  // TODO: handle all values
  return {
    publicKey: {
      rp: {
        name: dom.createForm.relyingParty.name.input.value
      },
      user: {
        id: new Uint8Array(16),
        name: dom.createForm.user.name.input.value,
        displayName: dom.createForm.user.displayName.input.value
      },
      challenge: new Uint8Array(32),
      pubKeyCredParams: [{
        type: 'public-key',
        alg: getAlgValueFromSelect(dom.createForm.pubKeyCredParams.alg.select)
      }],
      timeout: dom.createForm.timeout.input.value,
      attestation: getSelectValue(dom.createForm.attestation.select)
    }
  };
}

async function register() {
  try {
    const credentials = await navigator.credentials.create(getCreateOptions());

    lastCredentials = deepClone(credentials);
    lastCredentialsParsed = parseCredentials(credentials);

    const prettyCredentials = prettifyCredentials(credentials);
    const withHtml = prettyCredentialsWithHtml(prettyCredentials);

    log.debug(prettyCredentials);
    log.debug(withHtml);

    //dom.outputConsole.textContent = prettyCredentials;
    dom.outputConsole.innerHTML = withHtml;
  } catch(e) {
    log.debug(e);

    dom.outputConsole.textContent = getErrorMessage(e);
  }
}

function getGetOptions() {
  // TODO: handle all values
  return {
    publicKey: {
      challenge: new Uint8Array(32),
      timeout: dom.getForm.timeout.input.value,
      allowCredentials: [{
        type: 'public-key',
        id: lastCredentials.rawId,
        transports: ['usb']
      }],
      userVerification: getSelectValue(dom.getForm.userVerification.select)
    },
    mediation: getSelectValue(dom.getForm.mediation.select)
  };
}

async function authenticate() {
  try {
    const credentials = await navigator.credentials.get(getGetOptions());
    const prettyCredentials = prettifyCredentials(credentials);

    log.debug(prettyCredentials);

    dom.outputConsole.textContent = prettyCredentials;
  } catch(e) {
    log.debug(e);

    dom.outputConsole.textContent = getErrorMessage(e);
  }
}

function closeModal(event) {
  document.querySelector('.modal.is-active').classList.remove('is-active');
}

function showPasteModal(event) {
  dom.pasteModalInput.value = '';
  dom.pasteModal.classList.add('is-active');
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
    [gForm.allowCredentials.checkbox, [
      gForm.allowCredentials.button,
      gForm.allowCredentials.id.upload,
      gForm.allowCredentials.id.paste,
      gForm.allowCredentials.type.checkbox,
      gForm.allowCredentials.type.usbCheckbox,
      gForm.allowCredentials.type.nfcCheckbox,
      gForm.allowCredentials.type.bleCheckbox
    ]],
    [gForm.allowCredentials.type.checkbox, [
      gForm.allowCredentials.type.usbCheckbox,
      gForm.allowCredentials.type.nfcCheckbox,
      gForm.allowCredentials.type.bleCheckbox
    ]],
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
}

function setupEvents() {
  dom.registerButton.addEventListener('click', register);
  dom.authenticateButton.addEventListener('click', authenticate);

  dom.outputKeyModalCloseButton.addEventListener('click', closeModal);
  dom.pasteModalCloseButton.addEventListener('click', closeModal);
  dom.pasteModalOkButton.addEventListener('click', closeModal);

  dom.getForm.allowCredentials.id.paste
     .addEventListener('click', showPasteModal);

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
