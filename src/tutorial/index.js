import * as step1 from "./step-1.js";
import * as step2 from "./step-2.js";
import * as step3 from "./step-3.js";
import * as step4 from "./step-4.js";
import * as step5 from "./step-5.js";
import * as step6 from "./step-6.js";
import { modal } from "../util/modal";

if (
  !navigator.credentials ||
  !navigator.credentials.get ||
  !navigator.credentials.create
) {
  document.querySelector("#tutorial").classList.add("hidden");
  document.querySelector("#tutorial-error-message").classList.remove("hidden");
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

    // Withouth this timeout it does not focus in chrome,
    // The 1000ms is an aproximation of the time it takes to scroll to step 1, less results in jank
    window.setTimeout(() => {
      document.querySelector(".tutorial-step-1-input").focus();
    }, 1000);
  });
