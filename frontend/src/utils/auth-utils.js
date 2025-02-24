import config from "../config/config.js";

export class AuthUtils {
  static accessTokenKey = 'accessToken';
  static refreshTokenKey = 'refreshToken';
  static userInfoKey = 'userInfo';

  //Обновление токенов, если они устарели
  static async updateTokens() {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      const response = await fetch(config.host + '/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({refreshToken: refreshToken}),
      });

      if (response && response.status === 200) {
        const result = await response.json();
        if (result && !result.error) {
          this.setTokenKey(result.tokens.accessToken, result.tokens.refreshToken);
          return true;
        } else {
          throw new Error(result.message);
        }
      }
    }
    return false;
  }

  static setTokenKey(accessToken, refreshToken) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  static setUserInfo(info) {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info));
  }

  static getUserInfo() {
    const userInfo = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

  static removeUserData() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userInfoKey);
  }
}