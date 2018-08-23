export async function register(username, timeout) {
  const challenge = new Uint8Array(32);
  const userId = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  crypto.getRandomValues(userId);

  return navigator.credentials.create({
    publicKey: {
      rp: {
        name: 'Auth0 WebAuthn Playground'
      },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      challenge: challenge,
      pubKeyCredParams: [{
        type: 'public-key',
        alg: -7 // ES256
      }],
      timeout: timeout
    },
  });
}

export async function login(rawId) {

}
