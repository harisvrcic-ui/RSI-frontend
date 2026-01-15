import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../my-config';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';

export interface LanguageUpdateOrInsertRequest {
  id?: number | null;  // Optional or null for new language insertion
  name: string;
  nativeName?: string;
  code?: string;
  isActive: boolean;
}

export interface LanguageUpdateOrInsertResponse {
  id: number;
  name: string;
  nativeName?: string;
  code?: string;
  createdAt: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageUpdateOrInsertEndpointService implements MyBaseEndpointAsync<LanguageUpdateOrInsertRequest, LanguageUpdateOrInsertResponse> {
  private apiUrl = `${MyConfig.api_address}/languages`;

  constructor(private httpClient: HttpClient) {
  }

  handleAsync(request: LanguageUpdateOrInsertRequest) {
    return this.httpClient.post<LanguageUpdateOrInsertResponse>(`${this.apiUrl}`, request);
  }
}
