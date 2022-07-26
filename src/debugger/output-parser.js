import { deepClone, objectSlice, transform, prettyStringify, decodeCborFirst } from "./utils.js";

import { prettifyTransformations } from "./transformations.js";

import cbor from "cbor";
import log from "loglevel";

export function parseAuthenticatorData(authData) {
    authData =
        authData instanceof ArrayBuffer ?
        Buffer.from(authData) :
        authData;


    if (authData.byteLength < 37) {
        throw new Error(
            `Authenticator data was ${authData.byteLength} bytes, expected at least 37 bytes`,
        );
    }

    const result = {};
    let pointer = 0;

    result.rpIdHash = authData.slice(pointer, (pointer += 32)).toString('hex');

    const flagsBuf = authData.slice(pointer, (pointer += 1));
    const flagsInt = flagsBuf[0];

    // Bit positions can be referenced here:
    // https://w3c.github.io/webauthn/#flags
    result.flags = {
        userPresent: (flagsInt & 0x01) !== 0,
        reserved1: (flagsInt & 0x02) !== 0,
        userVerified: (flagsInt & 0x04) !== 0,
        backupEligibility: (flagsInt & 0x08) !== 0,
        backupState: (flagsInt & 0x10) !== 0,
        reserved2: (flagsInt & 0x20) !== 0,
        attestedCredentialData: (flagsInt & 0x40) !== 0,
        extensionDataIncluded: (flagsInt & 0x80) !== 0,
    };

    const counterBuf = authData.slice(pointer, (pointer += 4));
    result.signCount = counterBuf.readUInt32BE(0);

    if (result.flags.attestedCredentialData) {
        const atCredData = {};
        result.attestedCredentialData = atCredData;
  
        atCredData.aaguid = authData.slice(pointer, (pointer += 16));

        const credIdLenBuf = authData.slice(pointer, (pointer += 2));
        const credIdLen = credIdLenBuf.readUInt16BE(0);
  
        atCredData.credentialId = authData.slice(pointer, (pointer += credIdLen));
  
        // Decode the next CBOR item in the buffer, then re-encode it back to a Buffer
        const firstDecoded = decodeCborFirst(authData.slice(pointer));
        const firstEncoded = Buffer.from(cbor.encode(firstDecoded));
        atCredData.credentialPublicKey = firstEncoded;
        pointer += firstEncoded.byteLength;
    }

    if (result.flags.extensionDataIncluded) {
        const firstDecoded = decodeCborFirst(authData.slice(pointer));
        const firstEncoded = Buffer.from(cbor.encode(firstDecoded));
        const extensionsDataBuffer = firstEncoded;
        result.attestedExtensionData = cbor.decodeFirstSync(extensionsDataBuffer);
        pointer += firstEncoded.byteLength;
    }

    // Pointer should be at the end of the authenticator data, otherwise too much data was sent
    if (authData.byteLength > pointer) {
        throw new Error('Leftover bytes detected while parsing authenticator data');
    }

    return result;
}

export function parseAttestationObject(data) {
    const buffer =
        data instanceof ArrayBuffer ?
        Buffer.from(data) :
        Buffer.from(data.buffer, data.byteOffset, data.byteLength);

    try {
        const decoded = cbor.decodeFirstSync(buffer);

        if (decoded.authData) {
            decoded.authData = parseAuthenticatorData(decoded.authData);
        }

        return decoded;
    } catch (e) {
        const msg = "Failed to decode attestationObject, unknown attestation type? ";
        log.error(msg, e);
        return msg;
    }
}

export function parseClientDataJSON(data) {
    const decoder = new TextDecoder("utf-8");
    const decoded = decoder.decode(data);
    return JSON.parse(decoded);
}

export function parseCredentials(credentials) {
    const result = deepClone(credentials);
    const transformations = objectSlice(prettifyTransformations, [
        "clientDataJSON",
        "authenticatorData",
        "attestationObject",
    ]);

    transform(result, transformations);
    return result;
}

export function prettifyCredentials(credentials) {
    const creds = deepClone(credentials);
    transform(creds, prettifyTransformations);
    return splitCredentialsByType(creds);
}

export function addMarkupToLine(line) {
    const separator = line.indexOf(":");
    const head = line.substring(0, separator);
    const tail = line.substr(separator);

    if (separator < 0) {
        return line;
    }

    if (tail === ": {") {
        return `<span class="output-key">${head}</span>${tail}`;
    }

    return `<span class="output-key">${head}</span><span class="output-value">${tail}</span>`;
}

export function splitCredentialsByType(credentials) {
    let cred = `<code class="output-section"><pre>rawId: ${credentials.rawId}\nid: ${credentials.id}\ntype: ${credentials.type}\n</pre></code>\n<div class="output-section output-section-transparent">response: {</div>`;

    if (credentials.clientDataJSON && credentials.signature) {
        cred += `\n\n<code class="output-section output-section-turqoise"><pre>signature: ${
      credentials.signature
    }\n</pre>
      <pre>userHandle: ${credentials.userHandle}\n</pre>
      <pre>clientDataJSON: ${prettyStringify(
        credentials.clientDataJSON
      )}</pre></code>`;
    } else if (credentials.clientDataJSON) {
        cred += `<code class="output-section output-section-turqoise"><pre>clientDataJSON: ${prettyStringify(
      credentials.clientDataJSON
    )}</pre></code>`;
    }

    if (credentials.authenticatorAttachment || credentials.transports) {
        cred += `<code class="output-section output-section-green"><pre>`
        if (credentials.authenticatorAttachment) {
            cred += `authenticatorAttachment: ${credentials.authenticatorAttachment},\n`;
        }
        if (credentials.transports) {
            // registration only
            cred += `transports: ${prettyStringify(credentials.transports)},`;
        }
        cred += `</pre></code>`;
    }

    if (credentials.attestationObject) {
        cred += `<code class="output-section output-section-green"><pre>attestationObject: ${prettyStringify(
      credentials.attestationObject
    )},</pre></code>`;
    }

    if (credentials.authenticatorData) {
        cred += `<code class="output-section output-section-green"><pre>authenticatorData: ${prettyStringify(
      credentials.authenticatorData
    )},</pre></code>`;
    }

    if (credentials.extensions) {
        cred += `<code class="output-section output-section-green">
        <pre>extensions: ${prettyStringify(
        credentials.extensions
        )}</pre></code>`;
    }

    cred += `<div class="output-section output-section-transparent">}</div>`;

    return cred;
}

export function orderCredentialsByType(credentials) {
    const orderedCredentials = {
        rawId: credentials.rawId,
        id: credentials.id,
        type: credentials.type,
        clientDataJSON: credentials.response.clientDataJSON,
    };

    if (credentials.authenticatorAttachment) {
        orderedCredentials.authenticatorAttachment =
            credentials.authenticatorAttachment;
    }

    if (credentials.response.attestationObject) {
        orderedCredentials.attestationObject =
            credentials.response.attestationObject;
    }

    if (credentials.response.authenticatorData) {
        orderedCredentials.authenticatorData =
            credentials.response.authenticatorData;
    }

    if (credentials.response.signature) {
        orderedCredentials.signature = credentials.response.signature;
    }

    if (credentials.response.userHandle) {
        orderedCredentials.userHandle = credentials.response.userHandle;
    }

    if (typeof credentials.response.getTransports === 'function') {
        orderedCredentials.transports = credentials.response.getTransports();
    }

    if (typeof credentials.getClientExtensionResults === 'function') {
        orderedCredentials.extensions = credentials.getClientExtensionResults();
    }

    return orderedCredentials;
}

export function prettyCredentialsWithHtml(prettyCredentials) {
    let lines = prettyCredentials.split("\n");

    lines = lines.map((line) => {
        for (const key of Object.keys(prettifyTransformations)) {
            const keyStr = `"${key}": `;
            const idx = line.indexOf(keyStr);
            if (idx !== -1 && prettifyTransformations[key].buttons) {
                const pos = idx + keyStr.length;

                const head = line.substring(0, pos);
                const tail = line.substring(pos);

                let buttons = "";
                for (const but of prettifyTransformations[key].buttons) {
                    buttons +=
                        `<button class="button hide-mobile" data-key="${key}" onclick="outputButtonClick(event);">` +
                        `${but}</button>`;
                }
                line = `${head}${buttons} ${tail}`;
            }
        }

        return addMarkupToLine(line);
    });
    return lines.join("\n");
}

export function getUserPresentStatus(credentials) {
    const parsed = parseAttestationObject(credentials.response.attestationObject);
    console.log(parsed.authData.flags);
    return parsed.authData.flags.userPresent;
}