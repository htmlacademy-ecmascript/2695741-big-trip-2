import AbstractView from './abstract-view.js';

export default class AbstractStatefulView extends AbstractView {
  _state = {};

  constructor() {
    super();

    if (new.target === AbstractStatefulView) {
      throw new Error('Cannot instantiate AbstractStatefulView');
    }
  }

  _setState(update) {
    this._state = {...this._state, ...update};
  }

  updateData(update) {
    this._setState(update);
    this.updateElement();
  }

  updateElement() {
    const previousElement = this.element;
    this.removeElement();
    previousElement.replaceWith(this.element);
    this._restoreHandlers();
  }

  _restoreHandlers() {
    throw new Error('Handler restoration is not implemented');
  }
}
