import {Router} from "./router";

class App {
  private router: Router;

  constructor() {
    this.router = new Router();
    window.addEventListener('DOMContentLoaded', this.routeChanging.bind(this));
    window.addEventListener('popstate', this.routeChanging.bind(this));
  }

  private routeChanging(): void {
    this.router.openRoute().then();
  }
}

(new App());