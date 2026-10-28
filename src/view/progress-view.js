import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';

export default class ProgressView extends AbstractView {
  #message;

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return `<progress class="trip-progress" aria-label="${he.encode(this.#message)}"></progress>`;
  }
}
