import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';

export default class MessageView extends AbstractView {
  #message;

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return `<p class="trip-events__msg" role="status">${he.encode(this.#message)}</p>`;
  }
}
