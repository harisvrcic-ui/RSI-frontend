import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface GenderGetByIdResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GenderGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/genders`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<GenderGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
