import anime from 'animejs';

const elements = {
  object: document.getElementById('tutorial-step-1-animation-object')
};

const state = {
};

function getElements() {
  const svg = elements.object.contentWindow.document.firstChild;

  Object.assign(elements, {
    svg: svg,
    dot: svg.getElementById('Data-Dot'),
    lineRight: svg.getElementById('Line-Right'),
    lineLeft: svg.getElementById('Line-Left'),
    textRight: svg.getElementById('Text-Right').firstChild.firstChild,
    textLeft: svg.getElementById('Text-Left').firstChild.firstChild,
    check: svg.getElementById('Check'),
    countdown: svg.getElementById('Countdown'),
    countdown: svg.getElementById('Touch-Circles'),
  });
}

function getPositions(elems) {

}

function setupAnimation() {
  Object.assign(state, {
    initial: getPositions(elements),
    requestChallenge: {},
    receiveChallenge: {},
    sendToAuthenticator: {},
    responseFromAuthenticator: {}
  });

  const rect = elements.lineRight.getBoundingClientRect();

  anime({
    targets: elements.dot,
    translateX: [
      { value: -rect.width, duration: 1000 }
    ],
    easing: 'easeOutQuad'
  });
}

function setupListeners() {

}

export function init() {
  elements.object.onload = () => {
    getElements();
    setupListeners();
    setupAnimation();
  };
}
