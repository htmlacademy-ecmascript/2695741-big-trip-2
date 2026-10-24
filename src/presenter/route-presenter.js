import {render, RenderPosition} from '../render.js';
import ListView from '../view/list-view.js';
import MessageView from '../view/message-view.js';
import PointView from '../view/point-view.js';
import SummaryView from '../view/summary-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointFormView from '../view/point-form-view.js';
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
  #pointViews = new Map();
  #form = null;
  #addButton;
  #summaryView = null;
  #busy = false;

  constructor(store, container, header) {
    this.#store = store;
    this.#container = container;
    this.#header = header;
    this.#addButton = header.querySelector('.trip-main__event-add-btn');
    this.#addButton.addEventListener('click', () => this.#openForm());
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
    this.#summaryView?.getElement().remove();
    const points = [...this.#store.points].sort(SORTS.day);
    const destinations = points.map((point) => this.#store.getDestination(point.destination).name);
    const total = points.reduce((sum, point) => sum + this.#store.getPointPrice(point), 0);
    this.#summaryView = new SummaryView(points, destinations, total);
    render(this.#summaryView, this.#header, RenderPosition.AFTERBEGIN);
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
    this.#clearForm();
    this.#pointViews.clear();
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
      const view = this.#createPointView(point);
      this.#pointViews.set(point.id, view);
      render(view, this.#contentView.getElement());
    });
  }

  #openForm(point = null) {
    if (this.#busy) {
      return;
    }

    if (!point) {
      this.#filter = 'everything';
      this.#sort = 'day';
      this.#renderFilters();
    }

    this.#renderPoints();
    const draft = point ?? {
      type: 'flight',
      destination: null,
      dateFrom: null,
      dateTo: null,
      basePrice: 0,
      offers: [],
      isFavorite: false,
    };
    this.#form = new PointFormView(draft, this.#store.destinations, this.#store.offers, {
      onClose: this.#closeForm,
      onSave: (data) => this.#applyChange('save', () => this.#store.savePoint(data), () => this.#refreshRoute(), this.#form),
      onDelete: (id) => this.#applyChange('delete', () => this.#store.deletePoint(id), () => this.#refreshRoute(), this.#form),
    });

    if (point) {
      this.#pointViews.get(point.id).getElement().replaceWith(this.#form.getElement());
    } else {
      if (!this.#store.points.length) {
        this.#contentView.getElement().remove();
        this.#contentView = new ListView();
        render(this.#contentView, this.#container);
      }

      render(this.#form, this.#contentView.getElement(), RenderPosition.AFTERBEGIN);
      this.#addButton.disabled = true;
    }

    this.#form.init();
    document.addEventListener('keydown', this.#onEscape, true);
  }

  #clearForm() {
    this.#form?.destroy();
    this.#form = null;
    this.#addButton.disabled = false;
    document.removeEventListener('keydown', this.#onEscape, true);
  }

  #closeForm = () => {
    if (!this.#busy) {
      this.#renderPoints();
    }
  };

  #onEscape = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#closeForm();
    }
  };

  #createPointView(point) {
    return new PointView(point, this.#store.getDestination(point.destination), this.#store.getSelectedOffers(point), {
      onEdit: () => this.#openForm(point),
      onFavorite: () => {
        const view = this.#pointViews.get(point.id);
        this.#applyChange('favorite', () => this.#store.savePoint({...point, isFavorite: !point.isFavorite}), (saved) => {
          const updated = this.#createPointView(saved);
          view.getElement().replaceWith(updated.getElement());
          this.#pointViews.set(saved.id, updated);
        }, view);
      },
    });
  }

  #refreshRoute() {
    this.#renderSummary();
    this.#renderFilters();
    this.#renderPoints();
  }

  #setBlocked(blocked, action = null) {
    this.#header.inert = blocked;
    this.#container.inert = blocked;
    this.#addButton.disabled = blocked || Boolean(this.#form?.isNew);
    this.#form?.setPending(action);
  }

  async #applyChange(action, operation, onSuccess, feedback) {
    if (this.#busy) {
      return;
    }

    this.#busy = true;
    this.#setBlocked(true, action);

    try {
      const result = await operation();
      onSuccess(result);
    } catch {
      feedback.shake();
    } finally {
      this.#busy = false;
      this.#setBlocked(false);
    }
  }
}
