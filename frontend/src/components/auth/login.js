import config from "../../config/config.js";
import {AuthUtils} from "../../utils/auth-utils.js";
import {AuthService} from "../../services/auth-service.js";

export class Login {
  constructor() {
    this.buttonSubmitElement = document.getElementById('submitLogin');
    this.emailInputElement = document.getElementById('emailInput');
    this.passwordInputElement = document.getElementById('passwordInput');
    this.checkInputElement = document.getElementById('flexCheckDefault');

    if (localStorage.getItem(AuthUtils.accessTokenKey)) {
      window.location.href = '#/main';
      return;
    }

    if (localStorage.getItem('userEmail')) {
      this.emailInputElement.value = JSON.parse(localStorage.getItem('userEmail'));
    } else {
      this.emailInputElement.value = '';
    }

    this.emailInputElement.addEventListener('keydown', this.preventSpace.bind(this));
    this.buttonSubmitElement.addEventListener('click', this.login.bind(this));
  }

  validateForm() {

    let isValid = true;
    if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
      this.emailInputElement.classList.remove('is-invalid');
    } else {
      this.emailInputElement.classList.add('is-invalid');
      isValid = false;
    }

    if (this.passwordInputElement.value) {
      this.passwordInputElement.classList.remove('is-invalid');
    } else {
      this.passwordInputElement.classList.add('is-invalid');
      isValid = false;
    }

    return isValid;
  }

  //Запрет ввода пробелов
  preventSpace(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  }

  //Вход в систему
  async login(e) {
    e.preventDefault();
    if (this.validateForm()) {
      let data = {
        email: this.emailInputElement.value,
        password: this.passwordInputElement.value,
        rememberMe: this.checkInputElement.checked,
      }

      try {
        const result = await AuthService.request(config.host + '/login', 'POST', data);

        if (result) {
          if (result.error || !result.tokens || !result.user) {
            throw new Error(result.message);
          }
          const userData = {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            user: {
              userId: result.user.id,
              userName: result.user.name,
              userLastName: result.user.lastName,
            }
          }
          AuthUtils.setTokenKey(userData.accessToken, userData.refreshToken);
          AuthUtils.setUserInfo(userData.user);

          localStorage.removeItem('userEmail');
          window.location.href = "#/main";
        }
      } catch (e) {
        throw new Error(e);
      }

      this.emailInputElement.value = '';
      this.passwordInputElement.value = '';
      this.checkInputElement.checked = false;
    }
  }
}