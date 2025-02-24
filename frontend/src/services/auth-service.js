export class AuthService {
  static async request(url, method = 'GET', body = null) {

    const params = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
    if (body) {
      params.body = JSON.stringify(body);
    }
    const response = await fetch(url, params);
    if (response.status < 200 && response.status >= 300) {
      throw new Error(response.statusMessage);
    }
    return await response.json();
  }
}