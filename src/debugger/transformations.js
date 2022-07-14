import {
  parseAuthenticatorData,
  parseAttestationObject,
  parseClientDataJSON
} from './output-parser';

import coseToJwk from 'cose-to-jwk';

export function binToHex(data) {
  if(!(data instanceof Buffer)) {
    try {
      data = Buffer.from(data);
    } catch(e) {
      return '';
    }
  }

  return data.toString('hex');
}

export default function convertAAGUIDToString(aaguid) {
  // Raw Hex: adce000235bcc60a648b0b25f1f05503
  const hex = aaguid.toString('hex');

  const segments = [
    hex.slice(0, 8), // 8
    hex.slice(8, 12), // 4
    hex.slice(12, 16), // 4
    hex.slice(16, 20), // 4
    hex.slice(20, 32), // 8
  ];

  // Formatted: adce0002-35bc-c60a-648b-0b25f1f05503
  return segments.join('-');
}

export const prettifyTransformations = {
  rawId: {
    transform: binToHex,
    buttons: ['Use', 'Download']
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
    transform: arr => arr.map(binToHex),
    buttons: ['View', 'Download PEM']
  },
  credentialPublicKey: {
    transform: coseToJwk,
    buttons: ['Download COSE', 'Download JWK', 'Download PEM']
  },
  authenticatorData: {
    transform: parseAuthenticatorData
  },
  attestationObject: {
    transform: parseAttestationObject
  },
  clientDataJSON: {
    transform: parseClientDataJSON
  },
  aaguid: {
    transform: convertAAGUIDToString,
  },
  credentialId: {
    transform: binToHex,
  }
};
