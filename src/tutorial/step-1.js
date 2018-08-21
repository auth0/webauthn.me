import Animation from './animation.js';
import animations from './step-1-animations.js';

let animation;

async function register() {
  // Animation + business logic

  // 1. Request challenge
  await animation.trigger('challenge');
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
  document.querySelector('.tutorial-step-1-register').onclick = 
    () => register();
}

export function init() {
  const object = document.getElementById('tutorial-step-1-animation-object');
  object.onload = () => {
    setupListeners();
    setupAnimation(object);
  };
}
