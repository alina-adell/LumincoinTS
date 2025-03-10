export class AuthService {
  static async request(url: string, method: string = 'GET', body: any = null): Promise<any> {

    const params: any = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }
    if (body) {
      params.body = JSON.stringify(body);
    }
    const response: Response = await fetch(url, params);
    if (response.status < 200 && response.status >= 300) {
      throw new Error(response.statusText);
    }
    return await response.json();
  }
}