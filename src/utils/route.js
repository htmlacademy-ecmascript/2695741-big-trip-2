import {FilterType} from '../const.js';

const FILTERS = {
  [FilterType.EVERYTHING]: {
    label: 'Everything',
    message: 'Click New Event to create your first point',
    matches: () => true,
  },
  [FilterType.FUTURE]: {
    label: 'Future',
    message: 'There are no future events now',
    matches: (point, now) => new Date(point.dateFrom).getTime() > now,
  },
  [FilterType.PRESENT]: {
    label: 'Present',
    message: 'There are no present events now',
    matches: (point, now) => new Date(point.dateFrom).getTime() <= now && new Date(point.dateTo).getTime() >= now,
  },
  [FilterType.PAST]: {
    label: 'Past',
    message: 'There are no past events now',
    matches: (point, now) => new Date(point.dateTo).getTime() < now,
  },
};

const SORTS = {
  day: (first, second) => new Date(first.dateFrom) - new Date(second.dateFrom),
  time: (first, second) => (new Date(second.dateTo) - new Date(second.dateFrom)) - (new Date(first.dateTo) - new Date(first.dateFrom)),
  price: (first, second) => second.basePrice - first.basePrice,
};

const filterPoints = (points, filter, now = Date.now()) => points.filter((point) => FILTERS[filter].matches(point, now));

export {FILTERS, SORTS, filterPoints};
