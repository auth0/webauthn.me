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
  construct(svg) {
    this.svg = svg;
    this.elements = {
      dot: svg.getElementById('Data-Dot'),
      lineRight: svg.getElementById('Line-Right'),
      lineLeft: svg.getElementById('Line-Left'),
      textRight: svg.getElementById('Text-Right').firstChild.firstChild,
      textLeft: svg.getElementById('Text-Left').firstChild.firstChild,
      check: svg.getElementById('Check'),
      countdown: svg.getElementById('Countdown').firstChild,
      touchCircles: svg.getElementById('Touch-Circles')
    };

    // Save initial state of elements.
    /*this.initial = {
      dot: getTranslate(this.elements.dot),
      textRight: getText(this.elements.textRight),
      textLeft: getText(this.elements.textLeft),
      check: getTranslate(this.elements.check),
      countdown: {
        visibility: isVisible(this.element.countdown),
        text: getText(this.elements.countdown)
      },
      touchCircles: isVisible(this.element.touchCircles)
    };*/

    this.states = {};
  }

  addState(name, elements) {
    this.states[name] = elements;
  }

  async trigger(stateName) {

  }

  reset() {
    // Trigger reload of object element
    const html = this.svg.parentElement.parentElement.innerHTML;
    this.svg.parentElement.parentElement.innerHTML = html;
  }

  static get symbols() {
    return {
      dot: {
        side: {
          left: Symbol(),
          right: Symbol()
        },
        direction: {
          leftToRight: Symbol(),
          rightToLeft: Symbol()
        }
      },
      check: {
        left: Symbol(),
        center: Symbol(),
        right: Symbol()
      }
    };
  }
};

