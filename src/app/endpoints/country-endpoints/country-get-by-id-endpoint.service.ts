import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface CountryGetByIdResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CountryGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/countries`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<CountryGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
