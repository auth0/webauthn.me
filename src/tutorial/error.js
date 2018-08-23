export default function error(err) {
  console.log(err);
  // TODO: show error dialog.
  alert('ERROR, will reload.');
  window.location.reload();
}