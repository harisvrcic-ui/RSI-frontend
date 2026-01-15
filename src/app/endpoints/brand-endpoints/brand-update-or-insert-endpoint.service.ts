import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface BrandUpdateOrInsertRequest {
  id?: number | null;  // Optional, null for new brand
  name: string;
  isActive: boolean;
  logo?: string;       // Base64 string for logo
}

@Injectable({
  providedIn: 'root'
})
export class BrandUpdateOrInsertEndpointService implements MyBaseEndpointAsync<BrandUpdateOrInsertRequest, void> {
  private apiUrl = `${MyConfig.api_address}/brands`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: BrandUpdateOrInsertRequest) {
    return this.httpClient.post<void>(`${this.apiUrl}`, request);
  }
}
