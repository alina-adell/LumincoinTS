import config from "../../config/config.js";
import {AuthService} from "../../services/auth-service.js";
import {AuthUtils} from "../../utils/auth-utils.js";

export class SignUp {
  constructor() {
    this.buttonSubmitElement = document.getElementById('submitLogin');
    this.userNameInputElement = document.getElementById('userNameInput');
    this.emailInputElement = document.getElementById('emailInput');
    this.passwordInputElement = document.getElementById('passwordInput');
    this.repeatPasswordInputElement = document.getElementById('repeatPasswordInput');

    if (localStorage.getItem(AuthUtils.accessTokenKey)) {
      window.location.href = '#/main';
      return;
    }

    this.emailInputElement.addEventListener('keydown', this.preventSpace.bind(this));
    this.buttonSubmitElement.addEventListener('click', this.signUp.bind(this));
  }

  //Запрет ввода пробелов
  preventSpace(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  }

  //Валидация формы
  validateForm() {
    let isValid = true;

    if (this.userNameInputElement.value.trim() && this.userNameInputElement.value.match(/^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*\s[А-ЯЁ][а-яё]*$/)) {
      this.userNameInputElement.classList.remove('is-invalid');
    } else {
      this.userNameInputElement.classList.add('is-invalid');
      isValid = false;
    }

    if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
      this.emailInputElement.classList.remove('is-invalid');
    } else {
      this.emailInputElement.classList.add('is-invalid');
      isValid = false;
    }

    if (this.passwordInputElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
      this.passwordInputElement.classList.remove('is-invalid');
    } else {
      this.passwordInputElement.classList.add('is-invalid');
      isValid = false;
    }

    if (this.repeatPasswordInputElement.value && this.repeatPasswordInputElement.value === this.passwordInputElement.value) {
      this.repeatPasswordInputElement.classList.remove('is-invalid');
    } else {
      this.repeatPasswordInputElement.classList.add('is-invalid');
      isValid = false;
    }
    return isValid;
  }

  //Регистрация в системе
  async signUp(e) {
    e.preventDefault();
    if (this.validateForm()) {
      let splitStr = this.userNameInputElement.value.split(' ');
      let data = {
        name: splitStr[1],
        lastName: splitStr[0],
        email: this.emailInputElement.value,
        password: this.passwordInputElement.value,
        passwordRepeat: this.repeatPasswordInputElement.value,
      }

      try {
        const result = await AuthService.request(config.host + '/signup', 'POST', data);

        if (result) {
          if (result.error || !result.user) {
            throw new Error(result.message);
          }
          localStorage.setItem('userEmail', JSON.stringify(data.email));
          window.location.href = "#/login";
        }
      } catch (e) {
        console.error("Произошла ошибка при регистрации, обратитесь в поддержку " + e);
      }

      this.userNameInputElement.value = '';
      this.emailInputElement.value = '';
      this.passwordInputElement.value = '';
      this.repeatPasswordInputElement.value = '';
    }
  }
}