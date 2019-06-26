export function modal(selector = ".modal") {
  const modalElement = document.querySelector(selector);
  const modalMessageElement = modalElement.querySelector(".modal-message");
  const modalCloseButton = modalElement.querySelector(
    ".modal-header-close-button"
  );

  const onHideCallbacks = [];

  const show = message => {
    modalMessageElement.innerHTML = message;
    modalElement.classList.add("active");
  };

  const hide = () => {
    modalElement.classList.remove("active");

    onHideCallbacks.forEach(callback => {
      callback();
    });
  };

  const onHide = callback => {
    onHideCallbacks.push(callback);
  };

  modalCloseButton.addEventListener("mouseup", hide);

  return {
    show,
    hide,
    onHide
  };
}
