import Animation from './animation.js';

export default {
  'challenge': [{
    // Check center
      check: {
        translateX: Animation.offsets.check.center,
        opacity: 1
      }
    }, {
    // Request
    dot: {
      translateX: [
        Animation.offsets.dot.rightStart,
        Animation.offsets.dot.rightEnd
      ] 
    },
    textRight: 'CHALLENGE'
  }, {
    // Check right
    check: {
      translateX: Animation.offsets.check.right,
      opacity: 1
    }
  }, {
    // Wait
    wait: 1000
  }, {
    // Response
    dot: {
      translateX: Animation.offsets.dot.rightStart
    }
  }, {
    // Check center
    check: {
      translateX: Animation.offsets.check.center,
      opacity: 1
    },
    textRight: ' '
  }],

  'register': [{
    // Wait
    wait: 1000
  }, {
    // Register call to authenticator
    dot: {
      translateX: [
        Animation.offsets.dot.leftEnd,
        Animation.offsets.dot.leftStart
      ]
    },
    textLeft: 'CHALLENGE'
  }, {
    textLeft: ' '
  }]
};
