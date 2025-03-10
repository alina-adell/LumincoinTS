import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Logout} from "./components/auth/logout";
import {Main} from "./components/main";
import config from "./config/config";
import {HttpService} from "./services/http-service";
import {AuthUtils} from "./utils/auth-utils";
import {Revenue} from "./components/revenues/revenues";
import {RevenueAdd} from "./components/revenues/revenue-add";
import {RevenueEdit} from "./components/revenues/revenue-edit";
import {Expenses} from "./components/expenses/expenses";
import {ExpenseAdd} from "./components/expenses/expense-add";
import {ExpenseEdit} from "./components/expenses/expense-edit";
import {AllFinance} from "./components/all-finance/all-finance";
import {AllFinanceEdit} from "./components/all-finance/all-finance-edit";
import {AllFinanceAdd} from "./components/all-finance/all-finance-add";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";
import {BalanceType} from "./types/balance.type";
import {ErrorResponseType} from "./types/error-response.type";

export class Router {
  readonly contentPageElement: HTMLElement | null;
  readonly titleElement: HTMLElement | null;
  private userNameElement: NodeListOf<HTMLElement> | null | undefined;
  private routes: RouteType[];
  private currentStyles: HTMLLinkElement[];
  private balanceShowElement: NodeListOf<HTMLElement> | null | undefined;

  constructor() {
    this.contentPageElement = document.getElementById('content');
    this.titleElement = document.getElementById('titlePage');

    this.routes = [
      {
        route: '#/signup',
        title: 'Регистрация',
        template: '/templates/signup.html',
        layout: '',
        load: () => {
          new SignUp();
        }
      },
      {
        route: '#/login',
        title: 'Вход',
        template: '/templates/login.html',
        layout: '',
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
        load: () => {
          new Main();
        }
      },
      {
        route: '#/revenues',
        title: 'Доходы',
        template: '/templates/revenues/revenues.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues.css'],
        load: () => {
          new Revenue();
        }
      },
      {
        route: '#/revenue-add',
        title: 'Создание дохода',
        template: '/templates/revenues/revenues-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues-add.css'],
        load: () => {
          new RevenueAdd();
        }
      },
      {
        route: '#/revenue-edit',
        title: 'Редактирование дохода',
        template: '/templates/revenues/revenues-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/revenues/revenues-edit.css'],
        load: () => {
          new RevenueEdit();
        }
      },
      {
        route: '#/expenses',
        title: 'Расходы',
        template: '/templates/expenses/expenses.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses.css'],
        load: () => {
          new Expenses();
        }
      },
      {
        route: '#/expense-add',
        title: 'Создание расхода',
        template: '/templates/expenses/expenses-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses-add.css'],
        load: () => {
          new ExpenseAdd();
        }
      },
      {
        route: '#/expense-edit',
        title: 'Редактирование расхода',
        template: '/templates/expenses/expenses-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/expenses/expenses-edit.css'],
        load: () => {
          new ExpenseEdit();
        }
      },
      {
        route: '#/all-finance',
        title: 'Доходы и Расходы',
        template: '/templates/all-finance/all-finance.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance.css'],
        load: () => {
          new AllFinance();
        }
      },
      {
        route: '#/all-finance-add',
        title: 'Создание дохода/расхода',
        template: '/templates/all-finance/all-finance-add.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance-add.css'],
        load: () => {
          new AllFinanceAdd();
        }
      },
      {
        route: '#/all-finance-edit',
        title: 'Редактирование дохода/расхода',
        template: '/templates/all-finance/all-finance-edit.html',
        layout: '/templates/layout.html',
        styles: ['/styles/all-finance/all-finance-edit.css'],
        load: () => {
          new AllFinanceEdit();
        }
      },
    ];

    this.currentStyles = [];
  }

  //Роутинг по страницам
  public async openRoute(): Promise<void> {
    const hashRoute: string = window.location.hash.split('?')[0];
    const newRoute: RouteType | undefined = this.routes.find(item => {
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
      let content: HTMLElement | null = this.contentPageElement;
      if (newRoute.layout) {
        if (this.contentPageElement) {
          this.contentPageElement.innerHTML = await fetch(newRoute.layout).then(response => response.text());
        }
        content = document.getElementById('contentLayout');
      }
      if (content) {
        content.innerHTML = await fetch(newRoute.template).then(response => response.text());
      }

      this.userNameElement = document.querySelectorAll<HTMLElement>(".user-name");
      this.balanceShowElement = document.querySelectorAll<HTMLElement>(".balance-number");
      //Активация пунктов меню
      this.activateMenuItem(newRoute);
      //Подгружаем имя и баланс
      this.showBalance().then();
      this.showUserName().then();
      //Выход из системы
      this.logout();
    }

    //Подключение стилей
    if (newRoute.styles) {
      this.linkStyles(newRoute.styles);
    }

    //Отображение заголовка страницы
    if (this.titleElement) {
      this.titleElement.innerText = <string>newRoute.title;
    }
    //Выполнение функции загрузки функционала страницы
    if (typeof newRoute.load === 'function') {
      newRoute.load();
    }
  }

  //Отображение пользователя
  private async showUserName(): Promise<void> {
    const userInfo: UserInfoType | null = AuthUtils.getUserInfo();
    if (this.userNameElement) {
      if (userInfo && this.userNameElement.length > 0) {
        this.userNameElement.forEach((el: HTMLElement) => {
          (el as HTMLElement).innerText = userInfo.userName + " " + userInfo.userLastName;
        });
      }
    }
  }

  //Выход из системы
  private logout(): void {
    const logoutElement: NodeListOf<HTMLElement> = document.querySelectorAll(".person-out");
    const logoutLink: NodeListOf<HTMLElement> = document.querySelectorAll(".logout");

    const toggleModalElement: () => void = (): void => {
      logoutLink.forEach((el: HTMLElement) => {
        el.classList.toggle("logout-open");
      });
    }

    logoutElement.forEach((el: HTMLElement) => {
      el.addEventListener("click", (e: MouseEvent): void => {
        e.stopPropagation();
        toggleModalElement();
      });
    });
  }

  //Отображение баланса
  // private isBalanceShow: boolean = false;
  private async showBalance(): Promise<void> {
    // if (this.isBalanceShow) return;
    try {
      const result: BalanceType | ErrorResponseType = await HttpService.request(config.host + '/balance');
      if (result) {
        if (this.balanceShowElement) {
          this.balanceShowElement.forEach((el: HTMLElement) => {el.innerText = (result as BalanceType).balance.toString()});
        }
      }
      // this.isBalanceShow = true;
      if ((result as ErrorResponseType).error) {
        console.error((result as ErrorResponseType).message);
      }
    } catch (e) {
      console.error("Ошибка при получении баланса: ", e);
    }
  }

  //Активация пунктов меню
  private activateMenuItem(route: RouteType): void {
    const details: NodeListOf<HTMLElement> = document.querySelectorAll("details");
    //Массив с роутами для категорий
    const openDetailsRoutes: string[] = ['#/revenues', '#/expenses'];

    document.querySelectorAll<HTMLElement>('.layout .link-sidebar').forEach((item: HTMLElement) => {
      let href: string | null = item.getAttribute('href');

      if (href) {
        if ((route.route.includes(href) && href !== '#/login' && href !== '#/signup')) {
          item.classList.add('active-link');

          if (openDetailsRoutes.includes(href)) {
            details.forEach((details: HTMLElement) => details.setAttribute('open', 'open'));
          }
        } else {
          item.classList.remove('active-link');
        }
      }
    });
  }

  //Подключение стилей
  private linkStyles(styles: string[]): void {
    const headElement: HTMLElement | null = document.querySelector('head');
    styles.forEach((stylePath: string) => {
      const link: HTMLLinkElement = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylePath;
      if (headElement) {
        headElement.appendChild(link);
      }
      this.currentStyles.push(link);
    });
  }

  //Удаление стилей
  private removeCurrentStyles(): void {
    this.currentStyles.forEach((styleElement: HTMLLinkElement) => {
      styleElement.remove();
    });
    this.currentStyles = [];
  }
}