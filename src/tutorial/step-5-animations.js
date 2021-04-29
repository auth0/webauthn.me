import Animation from './animation.js';

export const timeout = 30;

export default {
  'push-button': [{
    countdown: timeout,
    touchCircles: Animation.symbols.show
  }],
  
  'response': [{
    countdown: Animation.symbols.hide,
    touchCircles: Animation.symbols.hide,
    dot: {
      translateX: [
        Animation.offsets.dot.leftStart,
        Animation.offsets.dot.leftEnd
      ]
    },
    textLeft: 'CHALLENGE + SIGNATURE'
  }, {
    check: {
      translateX: Animation.offsets.check.center,
      opacity: 1
    },
    textLeft: ' '
  }],

  'send-to-relying-party': [{
    wait: 1000
  }, {
    dot: {
      translateX: [
        Animation.offsets.dot.rightStart,
        Animation.offsets.dot.rightEnd
      ]
    },
    textRight: 'CHALLENGE + SIGNATURE'
  }, {
    check: {
      translateX: Animation.offsets.check.right,
      opacity: 1
    },
    textRight: ' '
  }]
};
