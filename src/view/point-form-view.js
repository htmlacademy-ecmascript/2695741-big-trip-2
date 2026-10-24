import flatpickr from 'flatpickr';
import ElementView from './element-view.js';
import {createFormTemplate, createDetailsTemplate} from './point-form-template.js';
import {toPickerDate, fromPickerDate} from '../utils/date.js';

export default class PointFormView extends ElementView {
  #point;
  #destinations;
  #offers;
  #pickers = [];

  constructor(point, destinations, offers, {onClose, onSave, onDelete}) {
    super();
    this.#point = structuredClone(point);
    this.#destinations = destinations;
    this.#offers = offers;
    this.getElement().addEventListener('input', this.#onInput);
    this.getElement().addEventListener('change', this.#onChange);
    this.getElement().querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const emptyPicker = this.#pickers.find((picker) => !picker.selectedDates.length);

      if (emptyPicker) {
        emptyPicker.open();
        return;
      }

      if (event.target.reportValidity()) {
        onSave(structuredClone(this.#point));
      }
    });
    this.getElement().querySelector('.event__rollup-btn')?.addEventListener('click', onClose);

    this.getElement().querySelector('.event__reset-btn').addEventListener('click', point.id ? () => onDelete(point.id) : onClose);
  }

  get isNew() {
    return !this.#point.id;
  }

  getTemplate() {
    return createFormTemplate(this.#point, this.#destinations, this.#offers);
  }

  init() {
    const settings = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
      disableMobile: true,
    };
    const fromPicker = flatpickr(this.getElement().querySelector('[name="event-start-time"]'), {
      ...settings,
      defaultDate: this.#point.dateFrom ? toPickerDate(this.#point.dateFrom) : null,
      onChange: ([date]) => {
        this.#point.dateFrom = date ? fromPickerDate(date) : null;
        const endPicker = this.#pickers[1];

        if (date && this.#point.dateTo && this.#point.dateTo < this.#point.dateFrom) {
          this.#point.dateTo = null;
          endPicker.clear(false);
        }

        endPicker.set('minDate', date ?? null);
      },
    });
    const toPicker = flatpickr(this.getElement().querySelector('[name="event-end-time"]'), {
      ...settings,
      defaultDate: this.#point.dateTo ? toPickerDate(this.#point.dateTo) : null,
      minDate: this.#point.dateFrom ? toPickerDate(this.#point.dateFrom) : null,
      onChange: ([date]) => {
        this.#point.dateTo = date ? fromPickerDate(date) : null;
      },
    });
    this.#pickers = [fromPicker, toPicker];
  }

  destroy() {
    this.#pickers.forEach((picker) => picker.destroy());
    this.#pickers = [];
    this.getElement().remove();
  }

  setPending(action) {
    this.#pickers.forEach((picker) => picker.close());
    this.getElement().querySelector('.event').classList.toggle('event--blocked', Boolean(action));
    this.getElement().querySelectorAll('input, button').forEach((control) => {
      control.disabled = Boolean(action);
    });
    this.getElement().querySelector('.event__save-btn').textContent = action === 'save' ? 'Saving...' : 'Save';
    const resetText = this.isNew ? 'Cancel' : 'Delete';
    this.getElement().querySelector('.event__reset-btn').textContent = action === 'delete' ? 'Deleting...' : resetText;
  }

  #onInput = (event) => {
    const input = event.target;

    if (input.name === 'event-price') {
      this.#point.basePrice = input.valueAsNumber;
    }

    if (input.name === 'event-destination') {
      const destination = this.#destinations.find((item) => item.name === input.value);
      this.#point.destination = destination?.id ?? null;
      input.setCustomValidity(destination ? '' : 'Choose a destination from the list');
      this.#renderDetails();
    }
  };

  #onChange = (event) => {
    const input = event.target;

    if (input.name === 'event-type') {
      this.#point.type = input.value;
      this.#point.offers = [];
      this.getElement().querySelector('.event__type-icon').src = `img/icons/${input.value}.png`;
      this.getElement().querySelector('.event__type-output').textContent = input.value;
      this.getElement().querySelector('.event__type-toggle').checked = false;
      this.#renderDetails();
    }

    if (input.name === 'event-offer') {
      this.#point.offers = [...this.getElement().querySelectorAll('[name="event-offer"]:checked')].map((offer) => offer.value);
    }
  };

  #renderDetails() {
    const form = this.getElement().querySelector('form');
    form.querySelector('.event__details')?.remove();
    form.insertAdjacentHTML('beforeend', createDetailsTemplate(this.#point, this.#destinations, this.#offers));
  }
}
