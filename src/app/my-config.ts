import { environment } from '../environments/environment';

export class MyConfig {
  static get api_address(): string {
    if (typeof window !== 'undefined' && window.location?.hostname === '10.0.2.2') {
      return 'http://10.0.2.2:5174';
    }
    return environment.apiUrl;
  }
}
