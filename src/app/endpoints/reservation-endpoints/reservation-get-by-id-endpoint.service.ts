import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReservationsGetByIdResponse {
  id: number;
  carID: number;
  parkingSpotID: number;
  reservationTypeID: number;
  startDate: string;
  endDate: string;
  finalPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationsGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reservations`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ReservationsGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
