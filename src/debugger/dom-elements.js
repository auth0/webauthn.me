// Create
export const createForm = {
  relyingParty: {
    id: {
      line: document.getElementById('d-c-rp-id-line'),
      checkbox: document.getElementById('d-c-rp-id-cbox'),
      input: document.getElementById('d-c-rp-id')
    },
    name: {
      line: document.getElementById('d-c-rp-name-line'),
      input: document.getElementById('d-c-rp-name'),
    }
  },
  user: {
    id: {
      line: document.getElementById('d-c-user-id-line'),
      button: document.getElementById('d-c-regen-uid')
    },
    name: {
      line: document.getElementById('d-c-user-name-line'),
      input: document.getElementById('d-c-user-name')
    },
    displayName: {
      line: document.getElementById('d-c-user-dp-line'),
      input: document.getElementById('d-c-user-dpname')
    }
  },
  challenge: {
    line: document.getElementById('d-c-challenge-line'),
    button: document.getElementById('d-c-regen-challenge')
  },
  pubKeyCredParams: {
    button: document.getElementById('d-c-add-pubkey-params'),
    alg: {
      line: document.getElementById('d-c-pubkey-alg-line'),
      select: document.getElementById('d-c-pubkey-alg-select')
    },
    placeholder: document.getElementById('d-c-add-pubkey-params-placeholder')
  },
  timeout: {
    line: document.getElementById('d-c-timeout-line'),
    input: document.getElementById('d-c-timeout')
  },
  excludeCredentials: {
    checkbox: document.getElementById('d-c-excl-creds-cbox'),
    button: document.getElementById('d-c-add-excl-creds'),
    id: {
      line: document.getElementById('d-c-excl-creds-id-line'),
      buttonBin: document.getElementById('d-c-upload-excl-creds-id'),
      buttonB64: document.getElementById('d-c-upload-base64-excl-creds-id')
    },
    type: {
      line: document.getElementById('d-c-excl-creds-type-line'),
      checkbox: document.getElementById('d-c-excl-creds-type-cbox'),
      usbCheckbox: document.getElementById('d-c-excl-creds-type-usb'),
      nfcCheckbox: document.getElementById('d-c-excl-creds-type-nfc'),
      bleCheckbox: document.getElementById('d-c-excl-creds-type-ble'),
    }
  },
  authenticatorSelect: {
    checkbox: document.getElementById('d-c-auth-sel-cbox'),
    authenticatorAttachment: {
      line: document.getElementById('d-c-auth-attach-line'),
      checkbox: document.getElementById('d-c-auth-attach-cbox'),
      select: document.getElementById('d-c-auth-attach-select')
    },
    requireResidentKey: {
      line: document.getElementById('d-c-req-res-key-line'),
      checkbox: document.getElementById('d-c-req-res-key-cbox'),
      input: document.getElementById('d-c-req-res-key-cbox-val')
    },
    userVerification: {
      line: document.getElementById('d-c-user-verif-line'),
      checkbox: document.getElementById('d-c-user-verif-cbox'),
      select: document.getElementById('d-c-user-verif-select')
    }
  },
  attestation: {
    line: document.getElementById('d-c-attest-line'),
    checkbox: document.getElementById('d-c-attest-cbox'),
    select: document.getElementById('d-c-attest-select')
  }
};

// Get
export const getForm = {
  challenge: {
    line: document.getElementById('d-g-challenge-line'),
    button: document.getElementById('d-g-regen-challenge')
  },
  timeout: {
    line: document.getElementById('d-g-timeout-line'),
    input: document.getElementById('d-g-timeout')
  },
  rpId: {
    line: document.getElementById('d-g-rp-id-line'),
    checkbox: document.getElementById('d-g-rp-id-cbox'),
    input: document.getElementById('d-g-rp-id')
  },
  allowCredentials: {
    checkbox: document.getElementById('d-g-allow-creds-cbox'),
    button: document.getElementById('d-g-add-allow-creds'),
    id: {
      line: document.getElementById('d-g-allow-creds-id-line'),
      span: document.getElementById('d-g-allow-creds-id'),
      upload: document.getElementById('d-g-upload-allow-creds-id'),
      paste: document.getElementById('d-g-paste-base64-allow-creds-id')
    },
    type: {
      line: document.getElementById('d-g-allow-creds-type-line'),
      checkbox: document.getElementById('d-g-allow-creds-type-cbox'),
      usbCheckbox: document.getElementById('d-g-allow-creds-type-usb'),
      nfcCheckbox: document.getElementById('d-g-allow-creds-type-nfc'),
      bleCheckbox: document.getElementById('d-g-allow-creds-type-ble'),
    },
    placeholder: document.getElementById('d-g-allow-creds-placeholder')
  },
  userVerification: {
    line: document.getElementById('d-g-user-verif-line'),
    checkbox: document.getElementById('d-g-user-verif-cbox'),
    select: document.getElementById('d-g-user-verif-select')
  },
  mediation: {
    line: document.getElementById('d-g-mediation-line'),
    checkbox: document.getElementById('d-g-mediation-cbox'),
    select: document.getElementById('d-g-mediation-select')
  }
};

// Other elements
export const registerButton =
  document.getElementById('debugger-register-button');

export const authenticateButton =
  document.getElementById('debugger-authenticate-button');

export const availableIndicatorSpan =
  document.getElementById('debugger-auth-available-indicator');

export const output = {
  uploadCBOR: document.getElementById('debugger-output-upload-cbor'),
  downloadCBOR: document.getElementById('debugger-output-download-cbor'),
  downloadJSON: document.getElementById('debugger-output-download-json'),
  console: document.getElementById('debugger-output-console'),
  keyModal: {
    modal: document.getElementById('debugger-key-modal'),
    closeButton: document.getElementById('debugger-key-modal-close-button'),
    pre: document.getElementById('debugger-key-modal-key')
  }
};

export const pasteModal = document.getElementById('debugger-paste-modal');

export const pasteModalCloseButton =
  document.getElementById('debugger-paste-modal-close-button');

export const pasteModalOkButton =
  document.getElementById('debugger-paste-modal-button-ok');

export const pasteModalInput =
  document.getElementById('debugger-paste-modal-input');


