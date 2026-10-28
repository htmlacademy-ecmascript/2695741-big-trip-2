import {createElement} from '../render.js';

const SHAKE_DURATION = 600;
const SHAKE_OFFSETS = [0, -8, 8, -8, 8, 0];

export default class AbstractView {
  #element = null;
  _callback = {};

  constructor() {
    if (new.target === AbstractView) {
      throw new Error('Cannot instantiate AbstractView');
    }
  }

  get template() {
    throw new Error('Template is not implemented');
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }

  shake() {
    this.element.animate(SHAKE_OFFSETS.map((offset) => ({transform: `translateX(${offset}px)`})), {duration: SHAKE_DURATION});
  }
}
