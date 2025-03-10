import config from "../../config/config";
import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";
import {LoginDataResponseType} from "../../types/login-type/login-data-response.type";
import {LoginResponseType} from "../../types/login-type/login-response.type";
import {LoginErrorType} from "../../types/login-type/login-error.type";
import {LoginDataResultType} from "../../types/login-type/login-data-result.type";

export class Login {
  readonly buttonSubmitElement: HTMLButtonElement | null;
  readonly emailInputElement: HTMLInputElement | null;
  readonly passwordInputElement: HTMLInputElement | null;
  private checkInputElement: HTMLInputElement | null;

  constructor() {
    this.buttonSubmitElement = document.getElementById('submitLogin') as HTMLButtonElement;
    this.emailInputElement = document.getElementById('emailInput') as HTMLInputElement;
    this.passwordInputElement = document.getElementById('passwordInput') as HTMLInputElement;
    this.checkInputElement = document.getElementById('flexCheckDefault') as HTMLInputElement;

    if (localStorage.getItem(AuthUtils.accessTokenKey)) {
      window.location.href = '#/main';
      return;
    }

    if (localStorage.getItem('userEmail')) {
      this.emailInputElement.value = JSON.parse((localStorage.getItem('userEmail') as string));
    } else {
      this.emailInputElement.value = '';
    }

    this.emailInputElement.addEventListener('keydown', this.preventSpace.bind(this));
    this.buttonSubmitElement.addEventListener('click', this.login.bind(this));
  }

  private validateForm() {

    let isValid: boolean = true;
    if (this.emailInputElement) {
      if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
        this.emailInputElement.classList.remove('is-invalid');
      } else {
        this.emailInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.passwordInputElement) {
      if (this.passwordInputElement.value) {
        this.passwordInputElement.classList.remove('is-invalid');
      } else {
        this.passwordInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }
    return isValid;
  }

  //Запрет ввода пробелов
  private preventSpace(e: KeyboardEvent): void {
    if (e.key === ' ') {
      e.preventDefault();
    }
  }

  //Вход в систему
  private async login(e: Event): Promise<void> {
    e.preventDefault();
    if (this.validateForm()) {
      let data: LoginDataResponseType = {
        email: (this.emailInputElement as HTMLInputElement).value,
        password: (this.passwordInputElement as HTMLInputElement).value,
        rememberMe: (this.checkInputElement  as HTMLInputElement).checked,
      }

      try {
        const result: LoginResponseType | LoginErrorType = await AuthService.request(config.host + '/login', 'POST', data);

        if (result) {
          if ((result as LoginErrorType).error || !(result as LoginResponseType).tokens || !(result as LoginResponseType).user) {
            throw new Error((result as LoginErrorType).message);
          }

          //Запасная проверка
          // if ('error' in result && result.error) {
          //   // Обработка ошибки
          //   const validationErrors = result.validation?.map(
          //     (v) => `${v.key}: ${v.message}`
          //   ).join('\n');
          //
          //   const errorMessage = validationErrors
          //     ? `${result.message}\n${validationErrors}`
          //     : result.message;
          //
          //   throw new Error(errorMessage);
          // }
          const userData: LoginDataResultType = {
            accessToken: (result as LoginResponseType).tokens.accessToken,
            refreshToken: (result as LoginResponseType).tokens.refreshToken,
            user: {
              userId: (result as LoginResponseType).user.id,
              userName: (result as LoginResponseType).user.name,
              userLastName: (result as LoginResponseType).user.lastName,
            }
          }
          AuthUtils.setTokenKey(userData.accessToken, userData.refreshToken);
          AuthUtils.setUserInfo(userData.user);

          localStorage.removeItem('userEmail');
          window.location.href = "#/main";
        }
      } catch (e) {
        console.error("Произошла ошибка при входе в систему, обратитесь в поддержку", e);
      }

      (this.emailInputElement as HTMLInputElement).value = '';
      (this.passwordInputElement as HTMLInputElement).value = '';
      (this.checkInputElement as HTMLInputElement).checked = false;
    }
  }
}