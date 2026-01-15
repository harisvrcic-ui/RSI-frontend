import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

@Injectable({
  providedIn: 'root'
})
export class CountryDeleteEndpointService {
  private apiUrl = `${MyConfig.api_address}/countries`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
