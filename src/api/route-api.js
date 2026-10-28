import ApiService from '../framework/api-service.js';
import {toClientPoint, toServerPoint} from './point-adapter.js';

const ENDPOINT = 'https://22.objects.htmlacademy.pro/big-trip';

export default class RouteApi {
  #service;

  constructor(service = new ApiService(ENDPOINT, `Basic ${crypto.randomUUID()}`)) {
    this.#service = service;
  }

  async getPoints() {
    const points = await this.#service.request('points');
    return points.map(toClientPoint);
  }

  getDestinations() {
    return this.#service.request('destinations');
  }

  getOffers() {
    return this.#service.request('offers');
  }

  async addPoint(point) {
    const saved = await this.#service.request('points', 'POST', toServerPoint(point));
    return toClientPoint(saved);
  }

  async updatePoint(point) {
    const saved = await this.#service.request(`points/${point.id}`, 'PUT', toServerPoint(point));
    return toClientPoint(saved);
  }

  deletePoint(id) {
    return this.#service.request(`points/${id}`, 'DELETE');
  }
}
