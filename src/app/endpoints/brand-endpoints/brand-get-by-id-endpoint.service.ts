import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface BrandGetByIdResponse {
  id: number;
  name: string;
  logo?: string; // base64 string
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandGetByIdEndpointService implements MyBaseEndpointAsync<number, BrandGetByIdResponse> {
  private apiUrl = `${MyConfig.api_address}/brands`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<BrandGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
