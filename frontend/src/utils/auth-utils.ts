import config from "../config/config";
import {UserInfoType} from "../types/user-info.type";
import {RefreshResponseType} from "../types/refresh-response.type";

export class AuthUtils {
  public static accessTokenKey: string = 'accessToken';
  public static refreshTokenKey: string = 'refreshToken';
  private static userInfoKey: string = 'userInfo';

  //Обновление токенов, если они устарели
  public static async updateTokens(): Promise<boolean> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      const response: Response = await fetch(config.host + '/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({refreshToken: refreshToken}),
      });

      if (response && response.status === 200) {
        const result: RefreshResponseType = await response.json();
        if (result && !result.error) {
          if (result.tokens) {
            this.setTokenKey(result.tokens.accessToken, result.tokens.refreshToken);
          }
          return true;
        } else {
          throw new Error(result.message);
        }
      }
    }
    return false;
  }

  public static setTokenKey(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  public static setUserInfo(info: UserInfoType): void {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info));
  }

  public static getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

  public static removeUserData() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userInfoKey);
  }
}