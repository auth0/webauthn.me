import Animation from './animation.js';
import animations from './step-2-animations.js';

let animation;

function scrollTo() {
  const pos = document.querySelector('.tutorial-step-2-container')
                      .getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: pos,
    behavior: 'smooth'
  });
}

export async function trigger(username) {
  console.log('step 2');
  
  scrollTo();
  
  await animation.trigger('push-button');
  //await animation.trigger('response');
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
  const object = document.getElementById('tutorial-step-2-animation-object');
  object.onload = () => {
    setupAnimation(object);
  };
}
