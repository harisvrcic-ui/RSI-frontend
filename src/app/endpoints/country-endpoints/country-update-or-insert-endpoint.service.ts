import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface CountryUpdateOrInsertRequest {
  id?: number | null;  // optional for new country
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CountryUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/countries`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: CountryUpdateOrInsertRequest) {
    return this.httpClient.post<void>(this.apiUrl, request);
  }
}
