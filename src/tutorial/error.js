export default function error(err) {
  console.log(err);
  alert('ERROR, will reload.');
  window.location.reload();
}