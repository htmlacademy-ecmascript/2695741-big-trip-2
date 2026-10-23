import ElementView from './element-view.js';
import {SORTS} from '../utils/route.js';

const COLUMNS = {
  day: 'Day',
  event: 'Event',
  time: 'Time',
  price: 'Price',
  offer: 'Offers',
};

export default class SortView extends ElementView {
  #current;

  constructor(current, onChange) {
    super();
    this.#current = current;
    this.getElement().addEventListener('change', (event) => onChange(event.target.value));
    this.getElement().addEventListener('submit', (event) => event.preventDefault());
  }

  getTemplate() {
    const columns = Object.entries(COLUMNS).map(([type, label]) => `
      <div class="trip-sort__item trip-sort__item--${type}">
        <input id="sort-${type}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${type}" ${type === this.#current ? 'checked' : ''} ${SORTS[type] ? '' : 'disabled'}>
        <label class="trip-sort__btn" for="sort-${type}">${label}</label>
      </div>`).join('');

    return `<form class="trip-events__trip-sort trip-sort" action="#" method="get">${columns}</form>`;
  }
}
