import config from "../../config/config";
import {AuthUtils} from "../../utils/auth-utils";
import {AuthService} from "../../services/auth-service";

export class Logout {
  constructor() {
    if (!localStorage.getItem(AuthUtils.accessTokenKey) || !localStorage.getItem(AuthUtils.refreshTokenKey)) {
      window.location.href = '#/login';
      return;
    }
    this.logout().then();
  }

  private async logout(): Promise<void> {
    await AuthService.request(config.host + '/logout', 'POST', {refreshToken: localStorage.getItem(AuthUtils.refreshTokenKey)});
    AuthUtils.removeUserData();
    window.location.href = "#/login";
  }
}