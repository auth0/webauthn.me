import * as step1 from "./step-1.js";
import * as step2 from "./step-2.js";
import * as step3 from "./step-3.js";
import * as step4 from "./step-4.js";
import * as step5 from "./step-5.js";
import * as step6 from "./step-6.js";
import { modal } from "./modal";
import { scrollTo } from "./utils.js";

if (
  !navigator.credentials ||
  !navigator.credentials.get ||
  !navigator.credentials.create
) {
  const warning = modal();
  warning.show(
    "Looks like your browser does not support the web authentication API, or it doesn't support public key-based credentials.<br/><br/>You won't be able to follow along with the interactive tutorial, but you can still get more information on the web authentication API."
  );
}

step1.init();
step2.init();
step3.init();
step4.init();
step5.init();
step6.init();

document
  .querySelector("[data-learn-more]")
  .addEventListener("mousedown", () => {
    scrollTo(".tutorial-step-1-container");
  });
