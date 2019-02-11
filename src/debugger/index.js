import { setupDebugger } from "./debugger";
import { tabs } from "./tabs";

if (
  !navigator.credentials ||
  !navigator.credentials.get ||
  !navigator.credentials.create
) {
  console.error("No webauthn support");
}

tabs();
setupDebugger();
