import { setupDebugger } from "./debugger";
import { tabs } from "../util/tabs";

if (
  !navigator.credentials ||
  !navigator.credentials.get ||
  !navigator.credentials.create
) {
  document.querySelector("#debugger").classList.add("hidden");
  document.querySelector("#debugger-error-message").classList.remove("hidden");
}

tabs();
setupDebugger();
