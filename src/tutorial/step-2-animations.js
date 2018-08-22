import Animation from './animation.js';

export default {
  'push-button': [{
    countdown: 15,
    touchCircles: Animation.symbols.show
  }],
  response: [{
    countdown: Animation.symbols.hide,
    touchCircles: Animation.symbols.hide,
    dot: {
      translateX: [
        Animation.offsets.dot.leftStart,
        Animation.offsets.dot.leftEnd
      ]
    },
    textLeft: '- SIGNATURE\n- PUBLIC KEY\n- RAW ID'
  }, {
    check: {
      translateX: Animation.offsets.check.center,
      opacity: 1
    },
    textLeft: ' '
  }]
};
