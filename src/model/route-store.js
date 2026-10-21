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
      this.#api.load('points'),
      this.#api.load('destinations'),
      this.#api.load('offers'),
    ]);

    this.points = points.map((point) => ({
      id: point.id,
      type: point.type,
      destination: point.destination,
      offers: point.offers,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      isFavorite: point.is_favorite,
    }));
    this.destinations = destinations;
    this.offers = offers;
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
