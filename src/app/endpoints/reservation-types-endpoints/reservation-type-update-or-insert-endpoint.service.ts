import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReservationTypeUpdateOrInsertRequest {
  id?: number;
  name: string;
  price: number;
}

export interface ReservationTypeUpdateOrInsertResponse {
  id: number;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationTypeUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/ReservationTypes`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ReservationTypeUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ReservationTypeUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ReservationTypeUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
