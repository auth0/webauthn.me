import { detect } from "detect-browser";

const credentialSupportIndicator = document.querySelector(
    "[data-credential-support]"
);
const platformAuthenticatorSupportIndicator = document.querySelector(
    "[data-platform-authenticator-support]"
);
const browserNamePlaceholder = document.querySelector("[data-browser-name]");
const browserVersionPlaceholder = document.querySelector(
    "[data-browser-version]"
);

(async() => {
    const browser = detect();
    const publicKeyCredentialSupport = !!window.PublicKeyCredential;
    const platformAuthenticatorSupport = !!(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());

    credentialSupportIndicator.classList.toggle(
        "supported",
        publicKeyCredentialSupport
    );
    platformAuthenticatorSupportIndicator.classList.toggle(
        "supported",
        platformAuthenticatorSupport
    );
    browserNamePlaceholder.innerHTML = browser.name;
    browserVersionPlaceholder.innerHTML = browser.version;
})();