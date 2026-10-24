import {toClientPoint, toServerPoint} from './point-adapter.js';

export default class RouteStore {
  #api;
  points = [];
  destinations = [];
  offers = [];

  constructor(api) {
    this.#api = api;
  }

  async load() {
    const [points, destinations, offers] = await Promise.all([
      this.#api.request('points'),
      this.#api.request('destinations'),
      this.#api.request('offers'),
    ]);

    this.points = points.map(toClientPoint);
    this.destinations = destinations;
    this.offers = offers;
  }

  async savePoint(point) {
    const resource = point.id ? `points/${point.id}` : 'points';
    const response = await this.#api.request(resource, point.id ? 'PUT' : 'POST', toServerPoint(point));
    const saved = toClientPoint(response);
    const index = this.points.findIndex((item) => item.id === saved.id);

    if (index === -1) {
      this.points.push(saved);
    } else {
      this.points[index] = saved;
    }

    return saved;
  }

  async deletePoint(id) {
    await this.#api.request(`points/${id}`, 'DELETE');
    this.points = this.points.filter((point) => point.id !== id);
  }

  getDestination(id) {
    return this.destinations.find((destination) => destination.id === id);
  }

  getSelectedOffers(point) {
    const available = this.offers.find((group) => group.type === point.type)?.offers ?? [];
    return available.filter((offer) => point.offers.includes(offer.id));
  }

  getPointPrice(point) {
    return point.basePrice + this.getSelectedOffers(point).reduce((sum, offer) => sum + offer.price, 0);
  }
}
