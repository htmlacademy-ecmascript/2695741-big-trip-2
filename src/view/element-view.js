import {createElement} from '../render.js';

export default class ElementView {
  #element = null;

  getElement() {
    if (!this.#element) {
      this.#element = createElement(this.getTemplate());
    }

    return this.#element;
  }

  shake() {
    this.getElement().animate([
      {transform: 'translateX(0)'},
      {transform: 'translateX(-8px)'},
      {transform: 'translateX(8px)'},
      {transform: 'translateX(-8px)'},
      {transform: 'translateX(8px)'},
      {transform: 'translateX(0)'},
    ], {duration: 600});
  }
}
