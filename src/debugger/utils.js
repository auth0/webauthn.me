import oids from './oids.js';

import { fromBER } from 'asn1js';
import { Certificate } from 'pkijs';
import cbor from 'cbor';

export function deepClone(object) {
  const result = {};

  for(const key in object) {
    const value = object[key];

    if(typeof value === 'object') {
      if(Array.isArray(value) ||
         value instanceof ArrayBuffer ||
         (value && ('length' in value))) {
        result[key] = value.slice();
      } else {
        result[key] = deepClone(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function objectSlice(object, keys) {
  const result = {};
  for(const key of keys) {
    if(key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

export function findKey(object, key) {
  if(key in object) {
    return object[key];
  }

  for(const k in object) {
    const value = object[k];
    if(typeof value === 'object') {
      const result = findKey(value, key);
      if(typeof result !== 'undefined') {
        return result;
      }
    }
  }
}

export function findKeyWithPath(object, key) {
  if(key in object) {
    return {
      path: key,
      value: object[key]
    };
  }

  for(const k in object) {
    const value = object[k];
    if(typeof value === 'object') {
      const result = findKey(value, key);
      if(typeof result.value !== 'undefined') {
        return {
          path: `${k}.${result.path}`,
          value: result.value
        };
      }
    }
  }

  return {
    path: '',
    value: undefined
  };
}

export function findAllKeys(object, key) {
  const result = [];

  for(const k in object) {
    const value = object[k];
    if(k == key) {
      result.push(value);
    }
    if(typeof value === 'object') {
      const r = findAllKeys(value, key);
      if(r.length > 0) {
        result.push(...r);
      }
    }
  }

  return result;
}

export function getByPath(object, path) {
  const split = path.split('.');
  let obj = object;
  for(const part of split) {
    obj = obj[part];
  }

  return obj;
}

export function transform(object, transformations) {
  Object.keys(object).forEach(key => {
    if(key in transformations) {
      object[key] = transformations[key].transform(object[key]);
    }

    if(typeof object[key] === 'object') {
      transform(object[key], transformations);
    }
  });
}

export function derToPem(der) {
  const b64 = Buffer.from(der).toString('base64');

  let withBreaks = '';
  for(let i = 0; i < b64.length; ++i) {
    withBreaks += (i % 64 === 0) ? `\r\n${b64[i]}` : b64[i];
  }

  return '-----BEGIN CERTIFICATE-----' +
         `${withBreaks}\r\n` +
         '-----END CERTIFICATE-----';
}

export function prettyStringify(object) {
  return JSON.stringify(object, null, 2);
}

export function x5cArrayToCertInfo(array) {
  const info = [];
  for(const x5c of array) {
    const buffer = x5c.buffer.slice(x5c.byteOffset,
                                    x5c.byteOffset + x5c.byteLength);
    const parsed = fromBER(buffer);
    const cert = new Certificate({ schema: parsed.result });
    const slice = {
      version: cert.version,
      serialNumber: Buffer.from(cert.serialNumber.valueBlock.valueHex)
                          .toString('hex'),
      signature: {
        algorithmId: oids[cert.signature.algorithmId],
        value: Buffer.from(cert.signatureValue.valueBlock.valueHex)
                    .toString('hex')
      },
      issuer: cert.issuer.typesAndValues[0].value.valueBlock.value,
      notBefore: cert.notBefore.value,
      notAfter: cert.notAfter.value,
      subject: cert.subject.typesAndValues.map(v => v.value.valueBlock.value),
      subjectPublicKeyInfo: cert.subjectPublicKeyInfo
    };
    info.push(prettyStringify(slice));
  }

  return info.join('\n');
}

export const cborEncoder = new cbor.Encoder({
  genTypes: [
    ArrayBuffer, (encoder, arrayBuffer) => {
      return encoder.pushAny(Buffer.from(arrayBuffer));
    },
  ]
});

export function getErrorMessage(e) {
  if(e instanceof Error) {
    return e.toString();
  }

  return JSON.stringify(e, null, 2);
}

export function getSelectValue(select) {
  return select.options[select.selectedIndex].value;
}

export function decodeCborFirst(input) {
  try {
    // throws if there are extra bytes
    return cbor.decodeFirstSync(input);
  } catch (err) {
    // if the error was due to extra bytes, return the unpacked value
    if (err.value) {
      return err.value;
    }
    throw err;
  }
}