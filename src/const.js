const UserAction = {
  ADD_POINT: 'ADD_POINT',
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
  UPDATE_FAVORITE: 'UPDATE_FAVORITE',
};

const UpdateType = {
  INIT: 'INIT',
  ERROR: 'ERROR',
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export {UserAction, UpdateType, FilterType};
