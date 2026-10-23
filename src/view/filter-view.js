import ElementView from './element-view.js';

export default class FilterView extends ElementView {
  #filters;
  #current;

  constructor(filters, current, onChange) {
    super();
    this.#filters = filters;
    this.#current = current;
    this.getElement().addEventListener('change', (event) => onChange(event.target.value));
    this.getElement().addEventListener('submit', (event) => event.preventDefault());
  }

  getTemplate() {
    const filters = this.#filters.map(({type, label, disabled}) => `
      <div class="trip-filters__filter">
        <input id="filter-${type}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${type}" ${type === this.#current ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <label class="trip-filters__filter-label" for="filter-${type}">${label}</label>
      </div>`).join('');

    return `<form class="trip-filters" action="#" method="get">${filters}</form>`;
  }
}
