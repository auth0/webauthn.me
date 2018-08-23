import Animation from './animation.js';
import animations from './step-2-animations.js';
import { timeout } from './step-2-animations.js';
import * as step3 from './step-3.js';
import error from './error.js';
import * as webauthn from './webauthn.js';
import { scrollTo } from './utils.js';

let animation;

export async function trigger(username) {  
  scrollTo('.tutorial-step-2-container');
  
  try {
    animation.trigger('push-button');

    const credentials = await webauthn.register(username, timeout * 1000);

    await animation.trigger('response');
    await animation.trigger('send-to-relying-party');

    step3.trigger(credentials);
  } catch(e) {
    error(e);
  }
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
