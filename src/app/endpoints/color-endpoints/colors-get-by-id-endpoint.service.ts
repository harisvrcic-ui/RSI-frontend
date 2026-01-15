import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ColorsGetByIdResponse {
  id: number;
  name: string;
  hexCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColorsGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/Colors`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ColorsGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
