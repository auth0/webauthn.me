import Animation from "./animation.js";
import { scrollTo, loadStep, activateStep, onObjectLoad } from "./utils.js";
import * as step4 from "./step-4.js";
import { credentialsGetPublicKeyJWK, isUserPresent } from "./webauthn.js";
import { binToHex } from "../debugger/transformations.js";

let animation;
let rawId;

const dom = {
    object: document.getElementById("tutorial-step-3-animation-object"),
    rawId: document.getElementById("tutorial-step-3-data-raw-id"),
    publicKey: document.getElementById("tutorial-step-3-data-public-key"),
};

export async function trigger(credentials) {
    rawId = credentials.rawId;

    const publicKey = JSON.stringify(
        credentialsGetPublicKeyJWK(credentials),
        null,
        2
    ).replace(/\{\n|\n\}|  /g, "");

    const userPresent = isUserPresent(credentials);
    if (!userPresent) {
        document
            .querySelector(".tutorial-step-3-up-warning")
            .classList.remove("hidden");
    }

    dom.rawId.textContent = binToHex(rawId);
    dom.publicKey.textContent = publicKey;

    animation.run({
        check: {
            translateX: Animation.offsets.check.center,
            opacity: 1,
        },
    });

    scrollTo(".tutorial-step-3-container");
    activateStep(3);
}

function setupAnimation(object) {
    const svg = object.contentDocument.firstChild;
    animation = new Animation(svg);
}

function setupListeners() {
    document.querySelector(".tutorial-step-3-next").onclick = (e) => {
        if (rawId) {
            step4.trigger(rawId);
            e.target.disabled = true;
        }
    };
}

export function init() {
    onObjectLoad(dom.object, () => {
        setupListeners();
        setupAnimation(dom.object);
        loadStep(3);
    });
}