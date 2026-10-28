import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class RouteStore extends Observable {
  #api;
  #points = [];
  #destinations = [];
  #offers = [];

  constructor(api) {
    super();
    this.#api = api;
  }

  get points() {
    return [...this.#points];
  }

  get destinations() {
    return [...this.#destinations];
  }

  get offers() {
    return [...this.#offers];
  }

  setPoints(points, updateType = UpdateType.INIT) {
    this.#points = [...points];
    this._notify(updateType);
  }

  async load() {
    let points;

    try {
      const [loadedPoints, destinations, offers] = await Promise.all([
        this.#api.getPoints(),
        this.#api.getDestinations(),
        this.#api.getOffers(),
      ]);

      points = loadedPoints;
      this.#destinations = destinations;
      this.#offers = offers;
    } catch {
      this._notify(UpdateType.ERROR);
      return;
    }

    this.setPoints(points);
  }

  async addPoint(point) {
    const saved = await this.#api.addPoint(point);
    this.#points = [...this.#points, saved];
    this._notify(UpdateType.MINOR, saved);
    return saved;
  }

  async updatePoint(point, updateType = UpdateType.MINOR) {
    if (!this.#points.some((item) => item.id === point.id)) {
      throw new Error('Point not found');
    }

    const saved = await this.#api.updatePoint(point);
    this.#points = this.#points.map((item) => item.id === saved.id ? saved : item);
    this._notify(updateType, saved);
    return saved;
  }

  async deletePoint(id) {
    await this.#api.deletePoint(id);
    this.#points = this.#points.filter((point) => point.id !== id);
    this._notify(UpdateType.MINOR);
  }

  getDestination(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getSelectedOffers(point) {
    const available = this.#offers.find((group) => group.type === point.type)?.offers ?? [];
    return available.filter((offer) => point.offers.includes(offer.id));
  }

  getPointPrice(point) {
    return point.basePrice + this.getSelectedOffers(point).reduce((sum, offer) => sum + offer.price, 0);
  }
}
