import {
  deepClone,
  objectSlice,
  transform,
  prettyStringify
} from './utils.js';

import {
  prettifyTransformations
} from './transformations.js';

import cbor from 'cbor';
import log from 'loglevel';

export function parseAuthenticatorData(data) {
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

export function parseAttestationObject(data) {
  const buffer = data instanceof ArrayBuffer ?
    Buffer.from(data) :
    Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  try {
    const decoded = cbor.decodeFirstSync(buffer);

    if(decoded.authData) {
      decoded.authData = parseAuthenticatorData(decoded.authData);
    }

    return decoded;
  } catch(e) {
    const msg = 'Failed to decode attestationObject, unknown attestation type?';
    log.error(msg);
    return msg;
  }
}

export function parseClientDataJSON(data) {
  const decoder = new TextDecoder('utf-8');
  const decoded = decoder.decode(data);
  return JSON.parse(decoded);
}

export function parseCredentials(credentials) {
  const result = deepClone(credentials);
  const transformations = objectSlice(prettifyTransformations, [
    'clientDataJSON',
    'authenticatorData',
    'attestationObject'
  ]);
  transform(result, transformations);
  return result;
}

export function prettifyCredentials(credentials) {
  const creds = deepClone(credentials);
  transform(creds, prettifyTransformations);
  return prettyStringify(creds);
}

export function prettyCredentialsWithHtml(prettyCredentials) {
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
