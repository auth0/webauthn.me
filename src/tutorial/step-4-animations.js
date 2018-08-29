import Animation from './animation.js';

export default {
  'request': [{
    check: {
      translateX: Animation.offsets.check.center,
      opacity: 1
    },
    dot: {
      translateX: [
        Animation.offsets.dot.rightStart,
        Animation.offsets.dot.rightEnd
      ]
    },
    textRight: 'USERNAME'
  }, {
    check: {
      translateX: Animation.offsets.check.right
    },
    wait: 1000
  }, {
    dot: {
      translateX: [
        Animation.offsets.dot.rightEnd,
        Animation.offsets.dot.rightStart
      ]
    },
    textRight: '- RAWID\n- CHALLENGE'
  }, {
    check: {
      translateX: Animation.offsets.check.center
    },
    textRight: ' ',
    wait: 1000
  }, {
    dot: {
      translateX: [
        Animation.offsets.dot.leftEnd,
        Animation.offsets.dot.leftStart
      ]
    },
    textLeft: '- RAWID\n- CHALLENGE'
  }, {
    check: {
      translateX: Animation.offsets.check.left.x,
      translateY: Animation.offsets.check.left.y
    },
    textLeft: ' '
  }]
};
