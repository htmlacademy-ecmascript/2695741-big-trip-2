import RouteApi from './api/route-api.js';
import RouteStore from './model/route-store.js';
import RoutePresenter from './presenter/route-presenter.js';

const store = new RouteStore(new RouteApi());
const presenter = new RoutePresenter(store, document.querySelector('.trip-events'), document.querySelector('.trip-main'));

presenter.init();
