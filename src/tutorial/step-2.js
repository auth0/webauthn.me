import Animation from "./animation.js";
import animations, { timeout } from "./step-2-animations.js";
import * as step3 from "./step-3.js";
import error from "./error.js";
import * as webauthn from "./webauthn.js";
import { scrollTo, loadStep, activateStep, onObjectLoad } from "./utils.js";

let animation;

export async function trigger(username) {
    scrollTo(".tutorial-step-2-container");
    activateStep(2);

    try {
        animation.trigger("push-button");

        const credentials = await webauthn.register(username, timeout * 1000);
        await animation.trigger("response");
        await animation.trigger("send-to-relying-party");

        step3.trigger(credentials);
    } catch (e) {
        error(e);
    }
}

function setupAnimation(object) {
    const svg = object.contentDocument.firstChild;
    animation = new Animation(svg);

    // Animation states
    for (const state of Object.keys(animations)) {
        animation.addState(state, animations[state]);
    }
}

export function init() {
    const object = document.getElementById("tutorial-step-2-animation-object");

    onObjectLoad(object, () => {
        loadStep(2);
        setupAnimation(object);
    });
}