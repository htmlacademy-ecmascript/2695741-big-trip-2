import {render, remove} from '../framework/render.js';
import {UpdateType} from '../const.js';
import {FILTERS, filterPoints} from '../utils/route.js';
import FilterView from '../view/filter-view.js';

export default class FilterPresenter {
  #store;
  #filterModel;
  #container;
  #view = null;
  #loading = true;

  constructor(store, filterModel, container) {
    this.#store = store;
    this.#filterModel = filterModel;
    this.#container = container;
  }

  init() {
    this.#store.addObserver(this.#onPointsChange);
    this.#filterModel.addObserver(this.#render);
    this.#render();
  }

  destroy() {
    this.#store.removeObserver(this.#onPointsChange);
    this.#filterModel.removeObserver(this.#render);
    remove(this.#view);
    this.#view = null;
  }

  #onPointsChange = (updateType) => {
    if (updateType === UpdateType.INIT) {
      this.#loading = false;
    }

    if (updateType === UpdateType.ERROR) {
      this.#loading = true;
    }

    this.#render();
  };

  #render = () => {
    remove(this.#view);
    const now = Date.now();
    const points = this.#store.points;
    const filters = Object.entries(FILTERS).map(([type, {label}]) => ({
      type,
      label,
      disabled: this.#loading || !filterPoints(points, type, now).length,
    }));
    this.#view = new FilterView(filters, this.#filterModel.filter, (filter) => this.#filterModel.setFilter(filter));
    render(this.#view, this.#container);
  };
}
