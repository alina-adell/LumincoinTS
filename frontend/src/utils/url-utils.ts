export class UrlUtils {
  static getUrlParams(param: string): string {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const value: string | null = urlParams.get(param);
    if (value === null) {
      throw new Error(`URL param ${param} not found`);
    }
    return  value;
  }
}