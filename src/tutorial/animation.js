import anime from "animejs";

const translateRegExp = /translate\(\s*([^\s,\)]+)[ ,]+([^\s,\)]+)/;
function getTranslate(element) {
  const transforms = element.getAttribute("transform");
  const matches = translateRegExp.exec(transforms);
  return matches
    ? {
        x: parseFloat(matches[1]),
        y: parseFloat(matches[2])
      }
    : {
        x: 0,
        y: 0
      };
}

function setTranslate(element, x, y) {
  const translate = `translate(${x},${y})`;

  let transforms = element.getAttribute("transform");
  if (!transforms) {
    transforms = translate;
  } else {
    transforms = transforms.replace(/translate\(.*\)/, translate);
  }

  element.setAttribute("transform", transforms);
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

/*function isVisible(element) {
  return element.style.display !== 'none';
}*/

function hide(element) {
  //element.style.display = 'none';
  element.style.opacity = 0;
}

function show(element) {
  //element.style.display = '';
  element.style.opacity = 1;
}

const symbols = {
  hide: Symbol(),
  show: Symbol()
};

export default class Animation {
  constructor(svg) {
    this.svg = svg;
    this.elements = {
      dot: svg.getElementById("Data-Dot"),
      lineRight: svg.getElementById("Line-Right"),
      lineLeft: svg.getElementById("Line-Left"),
      textRight: [
        svg.getElementById("Text-Right-1"),
        svg.getElementById("Text-Right-2"),
        svg.getElementById("Text-Right-3")
      ],
      textLeft: [
        svg.getElementById("Text-Left-1"),
        svg.getElementById("Text-Left-2"),
        svg.getElementById("Text-Left-3")
      ],
      check: svg.getElementById("Check"),
      countdown: svg.querySelector("#Countdown tspan"),
      touchCircles: svg.getElementById("Touch-Circles")
    };

    this.states = {};

    // Initial state
    hide(this.elements.check);
    this.elements.textRight.forEach(e => setText(e, " "));
    this.elements.textLeft.forEach(e => setText(e, " "));
    hide(this.elements.countdown);
    hide(this.elements.touchCircles);
    hide(this.elements.dot);

    this.checkY = getTranslate(this.elements.check).y;
  }

  addState(name, actions) {
    this.states[name] = actions;
  }

  async trigger(stateName) {
    const state = this.states[stateName];
    if (!state) {
      throw new Error("Unknown state");
    }

    for (const action of state) {
      await this.run(action);
    }
  }

  async run(action) {
    const promises = [];

    if (action.dot) {
      show(this.elements.dot);
      promises.push(
        anime(
          Object.assign(
            {
              targets: this.elements.dot,
              duration: 1000,
              easing: "easeOutQuad"
            },
            action.dot
          )
        ).finished.then(() => hide(this.elements.dot))
      );
    }

    if (action.check) {
      promises.push(
        anime(
          Object.assign(
            {
              targets: this.elements.check,
              translateY: this.checkY,
              duration: 0,
              easing: "linear"
            },
            action.check
          )
        ).finished
      );
    }

    if (action.textRight) {
      let split = action.textRight.split("\n");
      split.length = 3;
      split = split.map(l => (l ? l : " "));
      for (let i = 0; i < split.length; ++i) {
        setText(this.elements.textRight[i], split[i]);
      }
    }

    if (action.textLeft) {
      let split = action.textLeft.split("\n");
      split.length = 3;
      split = split.map(l => (l ? l : " "));
      for (let i = 0; i < split.length; ++i) {
        setText(this.elements.textLeft[i], split[i]);
      }
    }

    if (action.touchCircles) {
      if (action.touchCircles === symbols.show) {
        show(this.elements.touchCircles);
      } else {
        hide(this.elements.touchCircles);
      }
    }

    if (action.countdown === symbols.hide) {
      hide(this.elements.countdown);
      clearInterval(this.countdownInterval);
    } else if (typeof action.countdown === "number" && action.countdown > 0) {
      let countdown = action.countdown;

      show(this.elements.countdown);
      setText(this.elements.countdown, countdown);

      this.countdownInterval = setInterval(() => {
        --countdown;
        setText(this.elements.countdown, countdown);
        if (countdown === 0) {
          hide(this.elements.countdown);
          clearInterval(this.countdownInterval);
        }
      }, 1000);
    }

    if (action.wait) {
      promises.push(new Promise(resolve => setTimeout(resolve, action.wait)));
    }

    return Promise.all(promises);
  }

  reset() {
    // Trigger reload of object element
    const html = this.svg.parentElement.parentElement.innerHTML;
    this.svg.parentElement.parentElement.innerHTML = html;
  }

  static get symbols() {
    return symbols;
  }

  static get offsets() {
    return {
      dot: {
        leftStart: 0,
        leftEnd: 216.5,
        rightStart: 335,
        rightEnd: 216.5 + 335
      },
      check: {
        center: 388,
        left: {
          x: 30,
          y: 56
        },
        right: 388 + 342
      }
    };
  }
}
