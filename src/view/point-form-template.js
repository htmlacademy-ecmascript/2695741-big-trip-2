import he from 'he';

const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const createOffersTemplate = (offers, selected) => offers.length ? `
  <section class="event__section event__section--offers">
    <h3 class="event__section-title event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${offers.map((offer) => `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox visually-hidden" id="event-offer-${he.encode(offer.id)}" type="checkbox" name="event-offer" value="${he.encode(offer.id)}" ${selected.includes(offer.id) ? 'checked' : ''}>
          <label class="event__offer-label" for="event-offer-${he.encode(offer.id)}">
            <span class="event__offer-title">${he.encode(offer.title)}</span>
            &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
          </label>
        </div>`).join('')}
    </div>
  </section>` : '';

const createDestinationTemplate = (destination) => {
  if (!destination || (!destination.description && !destination.pictures.length)) {
    return '';
  }

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      ${destination.description ? `<p class="event__destination-description">${he.encode(destination.description)}</p>` : ''}
      ${destination.pictures.length ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((picture) => `<img class="event__photo" src="${he.encode(picture.src)}" alt="${he.encode(picture.description)}">`).join('')}
          </div>
        </div>` : ''}
    </section>`;
};

const createDetailsTemplate = (point, destinations, groups) => {
  const offers = groups.find((group) => group.type === point.type)?.offers ?? [];
  const destination = destinations.find((item) => item.id === point.destination);
  const details = createOffersTemplate(offers, point.offers) + createDestinationTemplate(destination);
  return details ? `<section class="event__details">${details}</section>` : '';
};

const createFormTemplate = (point, destinations, groups) => {
  const destination = destinations.find((item) => item.id === point.destination);

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(point.type)}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINT_TYPES.map((type) => `
                  <div class="event__type-item">
                    <input id="event-type-${type}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === point.type ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${type}" for="event-type-${type}">${type}</label>
                  </div>`).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination">${he.encode(point.type)}</label>
            <input class="event__input event__input--destination" id="event-destination" type="text" name="event-destination" value="${he.encode(destination?.name ?? '')}" list="destination-list" autocomplete="off" required>
            <datalist id="destination-list">
              ${destinations.map((item) => `<option value="${he.encode(item.name)}"></option>`).join('')}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time">From</label>
            <input class="event__input event__input--time" id="event-start-time" type="text" name="event-start-time" required>
            &mdash;
            <label class="visually-hidden" for="event-end-time">To</label>
            <input class="event__input event__input--time" id="event-end-time" type="text" name="event-end-time" required>
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price" type="number" name="event-price" value="${point.basePrice}" min="1" step="1" required>
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" disabled>Save</button>
          <button class="event__reset-btn" type="button" ${point.id ? 'disabled' : ''}>${point.id ? 'Delete' : 'Cancel'}</button>
          ${point.id ? '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Close event</span></button>' : ''}
        </header>
        ${createDetailsTemplate(point, destinations, groups)}
      </form>
    </li>`;
};

export {createFormTemplate, createDetailsTemplate};
