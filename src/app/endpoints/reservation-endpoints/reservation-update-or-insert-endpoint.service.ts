import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReservationsUpdateOrInsertRequest {
  id?: number;
  carID: number;
  parkingSpotID: number;
  reservationTypeID: number;
  startDate: string;  // ISO string
  endDate: string;
  finalPrice: number;
}

export interface ReservationsUpdateOrInsertResponse {
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
export class ReservationsUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reservations`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ReservationsUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ReservationsUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ReservationsUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
