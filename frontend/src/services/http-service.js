import {AuthUtils} from "../utils/auth-utils.js";

export class HttpService {
  static async request(url, method = 'GET', body = null) {

    const params = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    let token = localStorage.getItem(AuthUtils.accessTokenKey);
    if (token) {
      params.headers['x-auth-token'] = token;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    const response = await fetch(url, params);

    if (response.status < 200 || response.status >= 300) {
      if (response.status === 401) {
        const result = await AuthUtils.updateTokens();
        if (result) {
          return await this.request(url, method, body);
        } else {
          return null;
        }
      }
      throw new Error(response.statusMessage);
    }
    return await response.json();
  }
}