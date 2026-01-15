import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReservationTypeGetByIdResponse {
  id: number;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationTypeGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/ReservationTypes`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ReservationTypeGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
