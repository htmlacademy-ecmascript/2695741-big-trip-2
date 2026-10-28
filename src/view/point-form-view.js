import flatpickr from 'flatpickr';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {UserAction} from '../const.js';
import {createFormTemplate} from './point-form-template.js';
import {toPickerDate, fromPickerDate} from '../utils/date.js';

export default class PointFormView extends AbstractStatefulView {
  #destinations;
  #offers;
  #pickers = [];

  constructor(point, destinations, offers, callbacks) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this._callback = callbacks;
    this._setState({
      ...structuredClone(point),
      destinationName: destinations.find((item) => item.id === point.destination)?.name ?? '',
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
    this._restoreHandlers();
  }

  static parseStateToPoint(state) {
    return {
      id: state.id,
      type: state.type,
      destination: state.destination,
      offers: [...state.offers],
      basePrice: Number(state.basePrice),
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      isFavorite: state.isFavorite,
    };
  }

  get template() {
    return createFormTemplate(this._state, this.#destinations, this.#offers);
  }

  init() {
    const settings = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
      disableMobile: true,
    };
    const fromPicker = flatpickr(this.element.querySelector('[name="event-start-time"]'), {
      ...settings,
      defaultDate: this._state.dateFrom ? toPickerDate(this._state.dateFrom) : null,
      onChange: ([date]) => {
        const dateFrom = date ? fromPickerDate(date) : null;
        const endPicker = this.#pickers[1];
        this._setState({dateFrom});

        if (date && this._state.dateTo && this._state.dateTo < dateFrom) {
          this._setState({dateTo: null});
          endPicker.clear(false);
        }

        endPicker.set('minDate', date ?? null);
      },
    });
    const toPicker = flatpickr(this.element.querySelector('[name="event-end-time"]'), {
      ...settings,
      defaultDate: this._state.dateTo ? toPickerDate(this._state.dateTo) : null,
      minDate: this._state.dateFrom ? toPickerDate(this._state.dateFrom) : null,
      onChange: ([date]) => this._setState({dateTo: date ? fromPickerDate(date) : null}),
    });
    this.#pickers = [fromPicker, toPicker];
  }

  updateElement() {
    this.#destroyPickers();
    super.updateElement();
    this.init();
  }

  destroy() {
    this.#destroyPickers();
    this.element.remove();
    this.removeElement();
  }

  setPending(action) {
    this.updateData({
      isDisabled: Boolean(action),
      isSaving: action === UserAction.ADD_POINT || action === UserAction.UPDATE_POINT,
      isDeleting: action === UserAction.DELETE_POINT,
    });
  }

  _restoreHandlers() {
    this.element.addEventListener('input', this.#onInput);
    this.element.addEventListener('change', this.#onChange);
    this.element.querySelector('form').addEventListener('submit', this.#onSubmit);
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', this._callback.onClose);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#onReset);
    const destination = this.element.querySelector('[name="event-destination"]');
    destination.setCustomValidity(this._state.destinationName && !this._state.destination ? 'Choose a destination from the list' : '');
  }

  #destroyPickers() {
    this.#pickers.forEach((picker) => picker.destroy());
    this.#pickers = [];
  }

  #onSubmit = (event) => {
    event.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    const emptyPicker = this.#pickers.find((picker) => !picker.selectedDates.length);

    if (emptyPicker) {
      emptyPicker.open();
      return;
    }

    if (event.target.reportValidity()) {
      this._callback.onSave(PointFormView.parseStateToPoint(this._state));
    }
  };

  #onReset = () => {
    if (this._state.id) {
      this._callback.onDelete(this._state.id);
    } else {
      this._callback.onClose();
    }
  };

  #onInput = (event) => {
    const input = event.target;

    if (input.name === 'event-price') {
      this._setState({basePrice: input.value});
    }

    if (input.name === 'event-destination') {
      const destination = this.#destinations.find((item) => item.name === input.value);
      const caret = input.selectionStart;
      this.updateData({destination: destination?.id ?? null, destinationName: input.value});
      const restoredInput = this.element.querySelector('[name="event-destination"]');
      restoredInput.focus();
      restoredInput.setSelectionRange(caret, caret);
    }
  };

  #onChange = (event) => {
    const input = event.target;

    if (input.name === 'event-type') {
      this.updateData({type: input.value, offers: []});
    }

    if (input.name === 'event-offer') {
      const offers = [...this.element.querySelectorAll('[name="event-offer"]:checked')].map((offer) => offer.value);
      this._setState({offers});
    }
  };
}
