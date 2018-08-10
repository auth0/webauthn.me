import anime from 'animejs';

const translateRegExp = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/;
function getTranslate(element) {
  const transforms = element.getAttribute('transform');
  const matches = translateRegExp.exec(transforms);
  return matches ? {
    x: parseFloat(matches[1]),
    y: parseFloat(matches[2])
  } : {
    x: 0,
    y: 0
  };
}

function setTranslate(element, x, y) {
  const translate = `translate(${x},${y})`;

  let transforms = element.getAttribute('transform');
  if(!transforms) {
    transforms = translate;
  } else {
    transforms = transforms.replace(/translate\(.*\)/, translate);
  }

  element.setAttribute('transform', transforms);
}

function translate(element, dx, dy) {
  const old = getTranslate(element);
  setTranslate(element, old.x + dx, old.y + dy);
}

function getText(elemenet) {
  return element.textContent;
}

function setText(element, text) {
  element.textContent = text;
}

function isVisible(element) {
  return element.style.display !== 'none';
}

function hide(element) {
  element.style.display = 'none';
}

function show(element) {
  element.style.display = '';
}

export default class Animation {
  constructor(svg) {
    this.svg = svg;
    this.elements = {
      dot: svg.getElementById('Data-Dot'),
      lineRight: svg.getElementById('Line-Right'),
      lineLeft: svg.getElementById('Line-Left'),
      textRight: svg.querySelector('#Text-Right tspan'),
      textLeft: svg.querySelector('#Text-Left tspan'),
      check: svg.getElementById('Check'),
      countdown: svg.querySelector('#Countdown tspan'),
      touchCircles: svg.getElementById('Touch-Circles')
    };

    this.states = {};

    // Initial state
    hide(this.elements.check);
    setText(this.elements.textLeft, '');
    setText(this.elements.textRight, '');
    hide(this.elements.countdown);
    hide(this.elements.touchCircles);
  }

  addState(name, elements) {
    this.states[name] = elements;
  }

  async trigger(stateName) {
    const state = this.states[stateName];
    if(!state) {
      throw new Error('Unknown state');
    }

    for(const action of state) {
      await this.run(action);
    }
  }

  async run(action) {
    const promises = [];
    
    if(action.dot) {
      promises.push(anime(Object.assign({
        targets: this.elements.dot,
        duration: 1000,
        easing: 'easeOutQuad'
      }, action.dot)).finished);
    }

    if(action.check) {
      promises.push(anime(Object.assign({
        targets: this.elements.check,
        duration: 0,
        easing: 'linear'
      }, action.check)).finished);
    }

    if(action.textRight) {
      setText(this.elements.textRight, action.textRight);
    }

    if(action.textLeft) {
      setText(this.elements.textLeft, action.textLeft);
    }

    return Promise.all(promises);
  }

  reset() {
    // Trigger reload of object element
    const html = this.svg.parentElement.parentElement.innerHTML;
    this.svg.parentElement.parentElement.innerHTML = html;
  }

  static get symbols() {
    return {
      hide: Symbol(),
      show: Symbol()
    };
  }

  static get offsets() {
    return {
      dot: {
        distance: 216.5,
        toRight: 335
      },
      check: {
        centerToLeft: 344,
        centerToRight: 331
      }
    };
  }

};

