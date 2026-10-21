import {createElement} from '../render.js';

export default class ElementView {
  #element = null;

  getElement() {
    if (!this.#element) {
      this.#element = createElement(this.getTemplate());
    }

    return this.#element;
  }
}
