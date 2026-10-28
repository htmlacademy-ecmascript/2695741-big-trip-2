import RouteApi from './api/route-api.js';
import RouteStore from './model/route-store.js';
import FilterModel from './model/filter-model.js';
import RoutePresenter from './presenter/route-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';

const api = new RouteApi();
const store = new RouteStore(api);
const filterModel = new FilterModel();
const filterPresenter = new FilterPresenter(store, filterModel, document.querySelector('.trip-controls__filters'));
const presenter = new RoutePresenter(store, filterModel, document.querySelector('.trip-events'), document.querySelector('.trip-main'));

filterPresenter.init();
presenter.init();
store.load();
