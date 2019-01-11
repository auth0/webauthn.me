import Animation from "./animation.js";
import animations from "./step-6-animations.js";
import { scrollTo, loadStep, activateStep, onObjectLoad } from "./utils.js";

let animation;

export async function trigger(credentials) {
  scrollTo(".tutorial-step-6-container");
  activateStep(6);

  await animation.trigger("validated");
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
  const object = document.getElementById("tutorial-step-6-animation-object");
  onObjectLoad(object, () => {
    setupAnimation(object);
    loadStep(6);
  });
}
