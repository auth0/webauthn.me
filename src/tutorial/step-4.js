import { scrollTo } from './utils.js';
import { binToHex } from '../debugger/transformations.js';

let rawId;

const dom = {
  id: document.querySelector('.tutorial-step-4-allow-credentials-id-code')
};

export async function trigger(rawId_) {
  rawId = rawId_;

  dom.id.textContent = binToHex(rawId);
  
  scrollTo('.tutorial-step-4-container');
}

export function init() {
}
