import Animation from './animation.js';
import animations from './step-2-animations.js';

let animation;

export function trigger() {
  console.log('step 2');
}

function setupAnimation(object) {
  const svg = object.contentWindow.document.firstChild;
  animation = new Animation(svg);
  
  // Animation states
  for(const state of Object.keys(animations)) {
    animation.addState(state, animations[state]);
  }
}

export function init() {
  /*const object = document.getElementById('tutorial-step-1-animation-object');
  object.onload = () => {
    setupAnimation(object);
  };*/
}
