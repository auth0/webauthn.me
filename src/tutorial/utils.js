export function scrollTo(selector) {
  const pos =
    document.querySelector(selector).getBoundingClientRect().top +
    window.scrollY -
    130;

  window.scrollTo({
    top: pos,
    behavior: "smooth"
  });
}

export function loadStep(step) {
  const stepContainer = document.querySelector(
    `.tutorial-step-${step}-container`
  );

  stepContainer.classList.add("loaded");
}

export function activateStep(activeStep) {
  const stepContainers = document.querySelectorAll(".tutorial-step-container");
  const activeStepContainer = document.querySelector(
    `.tutorial-step-${activeStep}-container`
  );

  [].forEach.call(stepContainers, step => {
    step.classList.remove("active");
  });

  activeStepContainer.classList.add("active");
}

export function onObjectLoad(object, callback) {
  let isLoaded = false;

  const setLoaded = () => {
    isLoaded = true;
    return callback();
  };

  object.onLoad = () => {
    if (!isLoaded) {
      setLoaded();
    }
  };

  // Often the onLoad event is fired before we start listening to it,
  // Here we check if the object has a height, which indicates the svg`
  // inside the object has loaded.
  if (!isLoaded) {
    const interval = window.setInterval(() => {
      if (object.clientHeight > 0 && object.clientHeight <= 140) {
        window.clearInterval(interval);
        setLoaded();
      }
    }, 250);
  }
}
