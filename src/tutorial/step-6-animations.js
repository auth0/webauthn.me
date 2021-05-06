import Animation from './animation.js';

export const timeout = 30;

export default {
  'validated': [{
    dot: {
      translateX: [
        Animation.offsets.dot.rightEnd,
        Animation.offsets.dot.rightStart
      ]
    },
    textRight: 'VALIDATED'
  }, {
    check: {
      translateX: Animation.offsets.check.center,
      opacity: 1
    },
    textRight: ' '
  }]
};
