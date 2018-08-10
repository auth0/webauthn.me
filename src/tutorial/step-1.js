import Animation from './animation.js';

let animation;

async function register() {
}

function setupAnimation(object) {
  const svg = object.contentWindow.document.firstChild;
  animation = new Animation(svg);
  
  // Initial state
  animation.run({
    dot: {
      translateX: Animation.offsets.dot.distance
    }
  });
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
