import Animation from './animation.js';
import animations from './step-1-animations.js';
import * as step2 from './step-2.js';
import { scrollTo } from './utils.js';

let animation;

async function register(event) {
  scrollTo('.tutorial-step-1-container');

  await animation.trigger('challenge');
  await animation.trigger('register');
  
  const username = document.querySelector('.tutorial-step-1-input').value;
  step2.trigger(username);

  event.target.disabled = true;
}

function setupAnimation(object) {
  const svg = object.contentWindow.document.firstChild;
  animation = new Animation(svg);
  
  // Animation states
  for(const state of Object.keys(animations)) {
    animation.addState(state, animations[state]);
  }
}

function setupListeners() {
  document.querySelector('.tutorial-step-1-register').onclick = register;
}

export function init() {
  const object = document.getElementById('tutorial-step-1-animation-object');
  object.onload = () => {
    setupListeners();
    setupAnimation(object);
  };
}
