import Animation from "./animation.js";
import animations from "./step-1-animations.js";
import * as step2 from "./step-2.js";
import { loadStep, activateStep, onObjectLoad } from "./utils.js";

let animation;

async function register(event) {
  activateStep(1);

  await animation.trigger("challenge");
  await animation.trigger("register");

  const username = document.querySelector(".tutorial-step-1-input").value;
  step2.trigger(username);

  event.target.disabled = true;
}

function setupAnimation(object) {
  const svg = object.contentDocument.firstChild;
  animation = new Animation(svg);

  // Animation states
  for (const state of Object.keys(animations)) {
    animation.addState(state, animations[state]);
  }
}

function setupListeners() {
  document.querySelector(".tutorial-step-1-register").onclick = register;
}

export function init() {
  const object = document.querySelector("#tutorial-step-1-animation-object");

  onObjectLoad(object, () => {
    setupListeners();
    setupAnimation(object);
    loadStep(1);
    activateStep(1);
  });
}
