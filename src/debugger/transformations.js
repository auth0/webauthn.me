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
};
