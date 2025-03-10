import {AuthUtils} from "../utils/auth-utils";

export class HttpService {
  public static async request(url: string, method: string = 'GET', body: any = null): Promise<any> {

    const params: any = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    let token: string | null = localStorage.getItem(AuthUtils.accessTokenKey);
    if (token) {
      params.headers['x-auth-token'] = token;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    const response: Response = await fetch(url, params);

    if (response.status < 200 || response.status >= 300) {
      if (response.status === 401) {
        const result: boolean = await AuthUtils.updateTokens();
        if (result) {
          return await this.request(url, method, body);
        } else {
          return null;
        }
      }
      throw new Error(response.statusText);
    }
    return await response.json();
  }
}