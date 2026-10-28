import {render, remove, RenderPosition} from '../framework/render.js';
import {UserAction, UpdateType, FilterType} from '../const.js';
import PointPresenter from './point-presenter.js';
import ListView from '../view/list-view.js';
import MessageView from '../view/message-view.js';
import ProgressView from '../view/progress-view.js';
import SummaryView from '../view/summary-view.js';
import SortView from '../view/sort-view.js';
import {FILTERS, SORTS, filterPoints} from '../utils/route.js';

export default class RoutePresenter {
  #store;
  #filterModel;
  #container;
  #header;
  #sort = 'day';
  #sortView = null;
  #contentView = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #addButton;
  #summaryView = null;
  #progressView = null;
  #busy = false;

  constructor(store, filterModel, container, header) {
    this.#store = store;
    this.#filterModel = filterModel;
    this.#container = container;
    this.#header = header;
    this.#addButton = header.querySelector('.trip-main__event-add-btn');
  }

  init() {
    this.#store.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleFilterChange);
    this.#addButton.addEventListener('click', this.#onAddPoint);
    this.#contentView = new MessageView('Loading...');
    render(this.#contentView, this.#container);
  }

  destroy() {
    this.#store.removeObserver(this.#handleModelEvent);
    this.#filterModel.removeObserver(this.#handleFilterChange);
    this.#addButton.removeEventListener('click', this.#onAddPoint);
    this.#clearPoints();
    remove(this.#summaryView);
    remove(this.#progressView);
  }

  #renderSummary() {
    remove(this.#summaryView);
    const points = this.#store.points.sort(SORTS.day);
    const destinations = points.map((point) => this.#store.getDestination(point.destination).name);
    const total = points.reduce((sum, point) => sum + this.#store.getPointPrice(point), 0);
    this.#summaryView = new SummaryView(points, destinations, total);
    render(this.#summaryView, this.#header, RenderPosition.AFTERBEGIN);
  }

  #clearPoints() {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    remove(this.#sortView);
    this.#sortView = null;
    remove(this.#contentView);
    this.#contentView = null;
  }

  #renderPoints() {
    this.#clearPoints();
    this.#addButton.disabled = this.#busy;
    const filter = this.#filterModel.filter;
    const points = filterPoints(this.#store.points, filter).sort(SORTS[this.#sort]);

    if (!points.length) {
      this.#contentView = new MessageView(FILTERS[filter].message);
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
      const presenter = this.#createPointPresenter();
      this.#pointPresenters.set(point.id, presenter);
      presenter.init(point);
    });
  }

  #createPointPresenter() {
    return new PointPresenter(this.#store, this.#contentView.element, {
      onDataChange: this.#handleViewAction,
      onModeChange: this.#resetForms,
      onClose: this.#handleFormClose,
    });
  }

  #onAddPoint = () => {
    if (this.#busy) {
      return;
    }

    if (this.#filterModel.filter !== FilterType.EVERYTHING) {
      this.#filterModel.setFilter(FilterType.EVERYTHING);
    } else {
      this.#sort = 'day';
      this.#renderPoints();
    }

    if (!this.#store.points.length) {
      remove(this.#contentView);
      this.#contentView = new ListView();
      render(this.#contentView, this.#container);
    }

    this.#newPointPresenter = this.#createPointPresenter();
    this.#newPointPresenter.init();
    this.#addButton.disabled = true;
  };

  #resetForms = () => {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#addButton.disabled = this.#busy;
  };

  #handleFormClose = (presenter) => {
    if (presenter === this.#newPointPresenter) {
      this.#newPointPresenter = null;
      this.#addButton.disabled = this.#busy;

      if (!this.#store.points.length) {
        this.#renderPoints();
      }
    }
  };

  #setBlocked(blocked, action = null) {
    remove(this.#progressView);
    this.#progressView = null;

    if (blocked) {
      this.#progressView = new ProgressView(action === UserAction.DELETE_POINT ? 'Deleting...' : 'Saving...');
      render(this.#progressView, document.body);
    }

    this.#header.inert = blocked;
    this.#container.inert = blocked;
    this.#container.setAttribute('aria-busy', String(blocked));
    this.#addButton.disabled = blocked || Boolean(this.#newPointPresenter);
    this.#pointPresenters.forEach((presenter) => presenter.setPending(action));
    this.#newPointPresenter?.setPending(action);
  }

  #handleModelEvent = (updateType, point) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(point.id)?.init(point);
        this.#renderSummary();
        break;
      case UpdateType.INIT:
      case UpdateType.MINOR:
        this.#renderSummary();
        this.#renderPoints();
        break;
      case UpdateType.ERROR:
        this.#clearPoints();
        this.#contentView = new MessageView('Failed to load latest route information');
        render(this.#contentView, this.#container);
        this.#addButton.disabled = true;
        break;
    }
  };

  #handleViewAction = async (action, point, presenter) => {
    if (this.#busy) {
      return;
    }

    this.#busy = true;
    this.#setBlocked(true, action);
    let failed = false;

    try {
      switch (action) {
        case UserAction.ADD_POINT:
          await this.#store.addPoint(point);
          break;
        case UserAction.UPDATE_POINT:
          await this.#store.updatePoint(point);
          break;
        case UserAction.DELETE_POINT:
          await this.#store.deletePoint(point.id);
          break;
        case UserAction.UPDATE_FAVORITE:
          await this.#store.updatePoint(point, UpdateType.PATCH);
          break;
      }
    } catch {
      failed = true;
    } finally {
      this.#busy = false;
      this.#setBlocked(false);
    }

    if (failed) {
      presenter.shake();
    }
  };

  #handleFilterChange = () => {
    this.#sort = 'day';
    this.#renderPoints();
  };
}
