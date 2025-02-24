import {Router} from "./router.js";

class App {
  constructor() {
    this.router = new Router();
    window.addEventListener('DOMContentLoaded', this.routeChanging.bind(this));
    window.addEventListener('popstate', this.routeChanging.bind(this));
  }

  routeChanging() {
    this.router.openRoute().then();
  }
}

(new App());