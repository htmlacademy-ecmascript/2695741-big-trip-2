import he from 'he';
import ElementView from './element-view.js';
import {formatDate, formatDuration} from '../utils/date.js';

export default class PointView extends ElementView {
  #point;
  #destination;
  #offers;

  constructor(point, destination, offers, onEdit) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', onEdit);
  }

  getTemplate() {
    const {type, dateFrom, dateTo, basePrice, isFavorite} = this.#point;
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const offers = this.#offers.map((offer) => `
      <li class="event__offer">
        <span class="event__offer-title">${he.encode(offer.title)}</span>
        &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
      </li>`).join('');

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${formatDate(dateFrom, 'YYYY-MM-DD')}">${formatDate(dateFrom, 'MMM DD').toUpperCase()}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${he.encode(type)}.png" alt="${he.encode(title)}">
          </div>
          <h3 class="event__title">${he.encode(title)} ${he.encode(this.#destination.name)}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${he.encode(dateFrom)}">${formatDate(dateFrom, 'HH:mm')}</time>
              &mdash;
              <time class="event__end-time" datetime="${he.encode(dateTo)}">${formatDate(dateTo, 'HH:mm')}</time>
            </p>
            <p class="event__duration">${formatDuration(dateFrom, dateTo)}</p>
          </div>
          <p class="event__price">&euro;&nbsp;<span class="event__price-value">${basePrice}</span></p>
          <h4 class="visually-hidden">Offers:</h4>
          <ul class="event__selected-offers">${offers}</ul>
          <button class="event__favorite-btn${isFavorite ? ' event__favorite-btn--active' : ''}" type="button" aria-pressed="${isFavorite}" disabled>
            <span class="visually-hidden">${isFavorite ? 'Remove from favorite' : 'Add to favorite'}</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>`;
  }
}
