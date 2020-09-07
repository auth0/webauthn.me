import {
    parseAttestationObject,
    getUserPresentStatus,
} from "../debugger/output-parser.js";

import coseToJwk from "cose-to-jwk";

export async function register(username, timeout) {
    const challenge = new Uint8Array(32);
    const userId = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    crypto.getRandomValues(userId);

    return navigator.credentials.create({
        publicKey: {
            rp: {
                name: "Auth0 WebAuthn Playground",
            },
            user: {
                id: userId,
                name: username,
                displayName: username,
            },
            challenge: challenge,
            pubKeyCredParams: [{
                type: "public-key",
                alg: -7, // ES256
            }, ],
            timeout: timeout,
        },
    });
}

export async function login(rawId, timeout) {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    return navigator.credentials.get({
        publicKey: {
            challenge,
            timeout,
            allowCredentials: [{
                type: "public-key",
                id: rawId,
            }, ],
        },
    });
}

export function credentialsGetPublicKeyJWK(credentials) {
    if (!credentials ||
        !credentials.response ||
        !credentials.response.attestationObject
    ) {
        throw new Error("No public-key");
    }

    const parsed = parseAttestationObject(credentials.response.attestationObject);
    if (typeof parsed === "string") {
        throw new Error("Error parsing attestationObject: ", parsed);
    }

    try {
        return coseToJwk(
            parsed.authData.attestedCredentialData.credentialPublicKey
        );
    } catch (e) {
        throw new Error("No public-key: ", e);
    }
}

export function isUserPresent(credentials) {
    return getUserPresentStatus(credentials);
}