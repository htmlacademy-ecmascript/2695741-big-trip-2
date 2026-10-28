import AbstractView from '../framework/view/abstract-view.js';

export default class FilterView extends AbstractView {
  #filters;
  #current;

  constructor(filters, current, onChange) {
    super();
    this.#filters = filters;
    this.#current = current;
    this.element.addEventListener('change', (event) => onChange(event.target.value));
    this.element.addEventListener('submit', (event) => event.preventDefault());
  }

  get template() {
    const filters = this.#filters.map(({type, label, disabled}) => `
      <div class="trip-filters__filter">
        <input id="filter-${type}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${type}" ${type === this.#current ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <label class="trip-filters__filter-label" for="filter-${type}">${label}</label>
      </div>`).join('');

    return `<form class="trip-filters" action="#" method="get">${filters}</form>`;
  }
}
