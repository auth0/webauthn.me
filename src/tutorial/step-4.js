import Animation from "./animation.js";
import animations from "./step-4-animations.js";
import { scrollTo, loadStep, activateStep, onObjectLoad } from "./utils.js";
import { binToHex } from "../debugger/transformations.js";
import * as step5 from "./step-5.js";

let rawId;
let animation;

const dom = {
  object: document.getElementById("tutorial-step-4-animation-object"),
  id: document.querySelector(".tutorial-step-4-allow-credentials-id-code"),
  button: document.querySelector(".tutorial-step-4-login")
};

export async function trigger(rawId_) {
  rawId = rawId_;

  dom.id.textContent = binToHex(rawId);

  scrollTo(".tutorial-step-4-container");
  activateStep(4);
}

async function login(e) {
  await animation.trigger("request");
  step5.trigger(rawId);
  e.target.disabled = true;
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
  dom.button.onclick = login;
}

export function init() {
  onObjectLoad(dom.object, () => {
    setupListeners();
    setupAnimation(dom.object);
    loadStep(4);
  });
}
