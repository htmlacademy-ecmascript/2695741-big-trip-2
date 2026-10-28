import {render, remove, RenderPosition} from '../framework/render.js';
import {UserAction} from '../const.js';
import PointView from '../view/point-view.js';
import PointFormView from '../view/point-form-view.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const EMPTY_POINT = {
  type: 'flight',
  destination: null,
  dateFrom: null,
  dateTo: null,
  basePrice: 0,
  offers: [],
  isFavorite: false,
};

export default class PointPresenter {
  #store;
  #container;
  #callbacks;
  #point;
  #pointView = null;
  #formView = null;
  #mode = Mode.DEFAULT;
  #blocked = false;

  constructor(store, container, callbacks) {
    this.#store = store;
    this.#container = container;
    this.#callbacks = callbacks;
  }

  init(point = null) {
    this.#point = point ?? EMPTY_POINT;

    if (!point) {
      this.#showForm();
      return;
    }

    const previousView = this.#pointView;
    this.#pointView = new PointView(point, this.#store.getDestination(point.destination), this.#store.getSelectedOffers(point), {
      onEdit: this.#onEdit,
      onFavorite: () => this.#callbacks.onDataChange(UserAction.UPDATE_FAVORITE, {...this.#point, isFavorite: !this.#point.isFavorite}, this),
    });

    if (previousView) {
      previousView.element.replaceWith(this.#pointView.element);
      previousView.removeElement();
    } else {
      render(this.#pointView, this.#container);
    }
  }

  resetView = () => {
    if (this.#mode !== Mode.EDITING || this.#blocked) {
      return;
    }

    if (this.#pointView) {
      this.#formView.element.replaceWith(this.#pointView.element);
    }

    this.#formView.destroy();
    this.#formView = null;
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#onEscape, true);
    this.#callbacks.onClose(this);
  };

  destroy() {
    this.#formView?.destroy();
    this.#formView = null;
    remove(this.#pointView);
    this.#pointView = null;
    document.removeEventListener('keydown', this.#onEscape, true);
  }

  setPending(action) {
    this.#blocked = Boolean(action);
    this.#formView?.setPending(action);
  }

  shake() {
    (this.#formView ?? this.#pointView).shake();
  }

  #showForm() {
    this.#formView = new PointFormView(this.#point, this.#store.destinations, this.#store.offers, {
      onClose: this.resetView,
      onSave: (data) => this.#callbacks.onDataChange(data.id ? UserAction.UPDATE_POINT : UserAction.ADD_POINT, data, this),
      onDelete: (id) => this.#callbacks.onDataChange(UserAction.DELETE_POINT, {id}, this),
    });

    if (this.#pointView) {
      this.#pointView.element.replaceWith(this.#formView.element);
    } else {
      render(this.#formView, this.#container, RenderPosition.AFTERBEGIN);
    }

    this.#mode = Mode.EDITING;
    this.#formView.init();
    document.addEventListener('keydown', this.#onEscape, true);
  }

  #onEdit = () => {
    if (!this.#blocked) {
      this.#callbacks.onModeChange();
      this.#showForm();
    }
  };

  #onEscape = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.resetView();
    }
  };
}
