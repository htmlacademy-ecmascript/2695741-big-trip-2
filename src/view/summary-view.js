import he from 'he';
import ElementView from './element-view.js';
import {formatDate} from '../utils/date.js';

export default class SummaryView extends ElementView {
  #points;
  #destinations;
  #total;

  constructor(points, destinations, total) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#total = total;
  }

  getTemplate() {
    const first = this.#points[0];
    const last = this.#points[this.#points.length - 1];
    const names = this.#destinations;
    const title = names.length > 3 ? `${names[0]} — ... — ${names[names.length - 1]}` : names.join(' — ');
    const dates = first ? `${formatDate(first.dateFrom, 'D MMM')} — ${formatDate(last.dateTo, 'D MMM')}`.toUpperCase() : '';

    return `
      <section class="trip-main__trip-info trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${he.encode(title || 'Big Trip')}</h1>
          <p class="trip-info__dates">${dates}</p>
        </div>
        <p class="trip-info__cost">Total: &euro;&nbsp;<span class="trip-info__cost-value">${this.#total}</span></p>
      </section>`;
  }
}
