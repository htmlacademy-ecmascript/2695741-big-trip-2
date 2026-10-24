import he from 'he';
import ElementView from './element-view.js';

export default class MessageView extends ElementView {
  #message;

  constructor(message) {
    super();
    this.#message = message;
  }

  getTemplate() {
    return `<p class="trip-events__msg" role="status">${he.encode(this.#message)}</p>`;
  }
}
