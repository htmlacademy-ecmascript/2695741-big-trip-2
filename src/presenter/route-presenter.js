import {render, RenderPosition} from '../render.js';
import ListView from '../view/list-view.js';
import MessageView from '../view/message-view.js';
import PointView from '../view/point-view.js';
import SummaryView from '../view/summary-view.js';

export default class RoutePresenter {
  #store;
  #container;
  #header;

  constructor(store, container, header) {
    this.#store = store;
    this.#container = container;
    this.#header = header;
  }

  async init() {
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
    this.#renderRoute();
  }

  #renderRoute() {
    const points = [...this.#store.points].sort((first, second) => new Date(first.dateFrom) - new Date(second.dateFrom));
    const destinations = points.map((point) => this.#store.getDestination(point.destination).name);
    const total = points.reduce((sum, point) => sum + this.#store.getPointPrice(point), 0);
    render(new SummaryView(points, destinations, total), this.#header, RenderPosition.AFTERBEGIN);

    if (!points.length) {
      render(new MessageView('Click New Event to create your first point'), this.#container);
      return;
    }

    const list = new ListView();
    render(list, this.#container);

    points.forEach((point) => {
      render(new PointView(point, this.#store.getDestination(point.destination), this.#store.getSelectedOffers(point)), list.getElement());
    });
  }
}
