export function scrollTo(selector) {
  const pos =
    document.querySelector(selector).getBoundingClientRect().top +
    window.scrollY;

  window.scrollTo({
    top: pos,
    behavior: "smooth"
  });
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
  console.log(activeStepContainer, activeStep);
}
