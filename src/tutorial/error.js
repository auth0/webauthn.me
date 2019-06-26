import { modal } from "../util/modal";

export default function error(error) {
  const errorModal = modal();

  errorModal.show(
    `${error}. <br/><br/><strong>Close this modal reload the page so you can try again.</strong>`
  );

  errorModal.onHide(function() {
    window.location.reload();
  });
}
