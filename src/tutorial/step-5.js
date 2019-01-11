import Animation from "./animation.js";
import animations, { timeout } from "./step-5-animations.js";
import { scrollTo, loadStep, activateStep, onObjectLoad } from "./utils.js";
import * as webauthn from "./webauthn.js";
import error from "./error.js";
import * as step6 from "./step-6.js";

let animation;

export async function trigger(rawId) {
  scrollTo(".tutorial-step-5-container");
  activateStep(5);

  try {
    animation.trigger("push-button");

    const credentials = await webauthn.login(rawId, timeout * 1000);

    await animation.trigger("response");
    await animation.trigger("send-to-relying-party");

    step6.trigger(credentials);
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
  const object = document.getElementById("tutorial-step-5-animation-object");
  onObjectLoad(object, () => {
    setupAnimation(object);
    loadStep(5);
  });
}
