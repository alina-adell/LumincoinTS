import config from "../../config/config";
import {AuthService} from "../../services/auth-service";
import {AuthUtils} from "../../utils/auth-utils";
import {SignupDataResponseType} from "../../types/signup-type/signup-data-response.type";
import {SignupDataResultType} from "../../types/signup-type/signup-data-result.type";
import {SignupErrorType} from "../../types/signup-type/signup-error.type";

export class SignUp {
  private buttonSubmitElement: HTMLButtonElement | null;
  private userNameInputElement: HTMLInputElement | null;
  private emailInputElement: HTMLInputElement | null;
  private passwordInputElement: HTMLInputElement | null;
  private repeatPasswordInputElement: HTMLInputElement | null;

  constructor() {
    this.buttonSubmitElement = document.getElementById('submitLogin') as HTMLButtonElement;
    this.userNameInputElement = document.getElementById('userNameInput') as HTMLInputElement;
    this.emailInputElement = document.getElementById('emailInput') as HTMLInputElement;
    this.passwordInputElement = document.getElementById('passwordInput') as HTMLInputElement;
    this.repeatPasswordInputElement = document.getElementById('repeatPasswordInput') as HTMLInputElement;

    if (localStorage.getItem(AuthUtils.accessTokenKey)) {
      window.location.href = '#/main';
      return;
    }

    this.emailInputElement.addEventListener('keydown', this.preventSpace.bind(this));
    this.buttonSubmitElement.addEventListener('click', this.signUp.bind(this));
  }

  //Запрет ввода пробелов
  preventSpace(e: KeyboardEvent): void {
    if (e.key === ' ') {
      e.preventDefault();
    }
  }

  //Валидация формы
  validateForm() {
    let isValid = true;

    if (this.userNameInputElement) {
      if (this.userNameInputElement.value.trim() && this.userNameInputElement.value.match(/^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*\s[А-ЯЁ][а-яё]*$/)) {
        this.userNameInputElement.classList.remove('is-invalid');
      } else {
        this.userNameInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.emailInputElement) {
      if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
        this.emailInputElement.classList.remove('is-invalid');
      } else {
        this.emailInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.passwordInputElement) {
      if (this.passwordInputElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
        this.passwordInputElement.classList.remove('is-invalid');
      } else {
        this.passwordInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.repeatPasswordInputElement) {
      if (this.repeatPasswordInputElement.value && this.repeatPasswordInputElement.value === (this.passwordInputElement as HTMLInputElement).value) {
        this.repeatPasswordInputElement.classList.remove('is-invalid');
      } else {
        this.repeatPasswordInputElement.classList.add('is-invalid');
        isValid = false;
      }
    }
    return isValid;
  }

  //Регистрация в системе
  private async signUp(e: Event): Promise<void> {
    e.preventDefault();
    if (this.validateForm()) {
      let splitStr: string[] = (this.userNameInputElement as HTMLInputElement).value.split(' ');
      let data: SignupDataResponseType = {
        name: splitStr[1],
        lastName: splitStr[0],
        email: (this.emailInputElement as HTMLInputElement).value,
        password: (this.passwordInputElement as HTMLInputElement).value,
        passwordRepeat: (this.repeatPasswordInputElement as HTMLInputElement).value,
      }

      try {
        const result: SignupDataResultType | SignupErrorType = await AuthService.request(config.host + '/signup', 'POST', data);

        if (result) {
          if ((result as SignupErrorType).error || !(result as SignupDataResultType).user) {
            throw new Error((result as SignupErrorType).message);
          }
          localStorage.setItem('userEmail', JSON.stringify(data.email));
          window.location.href = "#/login";
        }
      } catch (e) {
        console.error("Произошла ошибка при регистрации, обратитесь в поддержку " + e);
      }

      (this.userNameInputElement as HTMLInputElement).value = '';
      (this.emailInputElement as HTMLInputElement).value = '';
      (this.passwordInputElement as HTMLInputElement).value = '';
      (this.repeatPasswordInputElement as HTMLInputElement).value = '';
    }
  }
}