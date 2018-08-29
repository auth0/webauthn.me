import Animation from './animation.js';
import { scrollTo } from './utils.js';

let animation;

export async function trigger() {  
  scrollTo('.tutorial-step-5-container');
}
