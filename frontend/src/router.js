import {Login} from "./components/auth/login.js";
import {SignUp} from "./components/auth/sign-up.js";
import {Logout} from "./components/auth/logout.js";
import {AuthUtils} from "./utils/auth-utils.js";

export class Router {
  constructor() {
    this.contentPageElement = document.getElementById('content');

    this.routes = [
      {
        route: '#/signup',
        title: 'Регистрация',
        template: '/templates/signup.html',
        layout: false,
        load: () => {
          new SignUp();
        }
      },
      {
        route: '#/login',
        title: 'Вход',
        template: '/templates/login.html',
        layout: false,
        load: () => {
          new Login();
        }
      },
      {
        route: '#/logout',
        load: () => {
          new Logout();
        }
      },
      {
        route: '#/main',
        title: 'Главная',
        template: '/templates/main.html',
        layout: '/templates/layout.html',
        styles: ['/styles/main.css'],
        // load: () => {
        // }
      },
      {
        route: '#/revenues',
        title: 'Доходы',
        template: '/templates/revenues/revenues.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues.css'],
        // load: () => {
        // }
      },
      {
        route: '#/revenue-add',
        title: 'Создание дохода',
        template: '/templates/revenues/revenues-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues-add.css'],
        // load: () => {
        // }
      },
      {
        route: '#/revenue-edit',
        title: 'Редактирование дохода',
        template: '/templates/revenues/revenues-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues-edit.css'],
        // load: () => {
        // }
      },
      {
        route: '#/expenses',
        title: 'Расходы',
        template: '/templates/expenses/expenses.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses.css'],
        // load: () => {
        // }
      },
      {
        route: '#/expense-add',
        title: 'Создание расхода',
        template: '/templates/expenses/expenses-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses-add.css'],
        // load: () => {
        // }
      },
      {
        route: '#/expense-edit',
        title: 'Редактирование расхода',
        template: '/templates/expenses/expenses-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses-edit.css'],
        // load: () => {
        // }
      },
      {
        route: '#/all-finance',
        title: 'Доходы и Расходы',
        template: '/templates/all-finance/all-finance.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance.css'],
        // load: () => {
        // }
      },
      {
        route: '#/all-finance-add',
        title: 'Создание дохода/расхода',
        template: '/templates/all-finance/all-finance-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance-add.css'],
        // load: () => {
        // }
      },
      {
        route: '#/all-finance-edit',
        title: 'Редактирование дохода/расхода',
        template: '/templates/all-finance/all-finance-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance-edit.css'],
        // load: () => {
        // }
      },
    ];

    this.currentStyles = [];
  }

  //Роутинг по страницам
  async openRoute() {
    const hashRoute = window.location.hash.split('?')[0];
    const newRoute = this.routes.find(item => {
      return item.route === hashRoute;
    });

    if (!newRoute) {
      window.location.href = "#/login";
      return;
    }

    if (newRoute.route !== '#/login' && newRoute.route !== '#/signup' && !localStorage.getItem('accessToken')) {
      window.location.href = "#/login";
      return;
    }

    //Удаление текущих стилей страницы
    this.removeCurrentStyles();

    //Отрисовка страниц с layout и без него
    if (newRoute.template) {
      let content = this.contentPageElement;
      if (newRoute.layout) {
        this.contentPageElement.innerHTML = await fetch(newRoute.layout).then(response => response.text());
        content = document.getElementById('contentLayout');
      }
      content.innerHTML = await fetch(newRoute.template).then(response => response.text());

      //Подгружаем имя
      this.showUserName().then();
      this.logout();

    }
    //Подключение стилей
    if (newRoute.styles) {
      this.linkStyles(newRoute.styles);
    }
    //Отображение заголовка страницы
    const titleElement = document.getElementById('titlePage');
    if (titleElement) {
      titleElement.innerText = newRoute.title;
    }
    //Выполнение функции загрузки функционала страницы
    if (typeof newRoute.load === 'function') {
      newRoute.load();
    }
  }
  //Отображение пользователя
  async showUserName() {
    this.userNameElement = document.querySelectorAll(".user-name");
    const userInfo = AuthUtils.getUserInfo();
    if (userInfo && this.userNameElement.length > 0) {
      this.userNameElement.forEach(el => el.innerText = userInfo.userName + " " + userInfo.userLastName);
    }
  }

  //Выход из системы
  logout() {
    const logoutElement = document.querySelectorAll(".person-out");
    const logoutLink = document.querySelectorAll(".logout");

    const toggleModalElement = () => {
      logoutLink.forEach(el => {
        el.classList.toggle("logout-open");
      });
    }

    logoutElement.forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleModalElement();
      });
    });
  }
  //Подключение стилей
  linkStyles(styles) {
    const headElement = document.querySelector('head');
    styles.forEach(stylePath => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylePath;
      headElement.appendChild(link);
      this.currentStyles.push(link);
    });
  }
  //Удаление стилей
  removeCurrentStyles() {
    this.currentStyles.forEach(styleElement => {
      styleElement.remove();
    });
    this.currentStyles = [];
  }
}