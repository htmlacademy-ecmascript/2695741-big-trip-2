import ElementView from './element-view.js';

export default class ListView extends ElementView {
  getTemplate() {
    return '<ul class="trip-events__list"></ul>';
  }
}
