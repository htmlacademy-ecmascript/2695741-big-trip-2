import {render, RenderPosition} from '../render.js';
import ListView from '../view/list-view.js';
import MessageView from '../view/message-view.js';
import PointView from '../view/point-view.js';
import SummaryView from '../view/summary-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import {FILTERS, SORTS, filterPoints} from '../utils/route.js';

export default class RoutePresenter {
  #store;
  #container;
  #header;
  #filter = 'everything';
  #sort = 'day';
  #filterView = null;
  #sortView = null;
  #contentView = null;

  constructor(store, container, header) {
    this.#store = store;
    this.#container = container;
    this.#header = header;
  }

  async init() {
    this.#renderFilters(true);
    const loading = new MessageView('Loading...');
    render(loading, this.#container);

    try {
      await this.#store.load();
    } catch {
      loading.getElement().remove();
      render(new MessageView('Failed to load latest route information'), this.#container);
      return;
    }

    loading.getElement().remove();
    this.#renderSummary();
    this.#renderFilters();
    this.#renderPoints();
  }

  #renderSummary() {
    const points = [...this.#store.points].sort(SORTS.day);
    const destinations = points.map((point) => this.#store.getDestination(point.destination).name);
    const total = points.reduce((sum, point) => sum + this.#store.getPointPrice(point), 0);
    render(new SummaryView(points, destinations, total), this.#header, RenderPosition.AFTERBEGIN);
  }

  #renderFilters(loading = false) {
    this.#filterView?.getElement().remove();
    const now = Date.now();
    const filters = Object.entries(FILTERS).map(([type, {label}]) => ({
      type,
      label,
      disabled: loading || !filterPoints(this.#store.points, type, now).length,
    }));

    this.#filterView = new FilterView(filters, this.#filter, (filter) => {
      this.#filter = filter;
      this.#sort = 'day';
      this.#renderFilters();
      this.#renderPoints();
    });
    render(this.#filterView, this.#header.querySelector('.trip-controls__filters'));
  }

  #renderPoints() {
    this.#sortView?.getElement().remove();
    this.#contentView?.getElement().remove();
    const points = filterPoints(this.#store.points, this.#filter).sort(SORTS[this.#sort]);

    if (!points.length) {
      this.#contentView = new MessageView(FILTERS[this.#filter].message);
      render(this.#contentView, this.#container);
      return;
    }

    this.#sortView = new SortView(this.#sort, (sort) => {
      this.#sort = sort;
      this.#renderPoints();
    });
    render(this.#sortView, this.#container);
    this.#contentView = new ListView();
    render(this.#contentView, this.#container);

    points.forEach((point) => {
      render(new PointView(point, this.#store.getDestination(point.destination), this.#store.getSelectedOffers(point)), this.#contentView.getElement());
    });
  }
}
