import config from "../../config/config.js";
import {AuthUtils} from "../../utils/auth-utils.js";
import {AuthService} from "../../services/auth-service.js";

export class Logout {
  constructor() {
    if (!localStorage.getItem(AuthUtils.accessTokenKey) || !localStorage.getItem(AuthUtils.refreshTokenKey)) {
      return window.location.href = '#/login';
    }
    this.logout().then();
  }

  async logout() {
    await AuthService.request(config.host + '/logout', 'POST', {refreshToken: localStorage.getItem(AuthUtils.refreshTokenKey)});
    AuthUtils.removeUserData();
    window.location.href = "#/login";
  }
}