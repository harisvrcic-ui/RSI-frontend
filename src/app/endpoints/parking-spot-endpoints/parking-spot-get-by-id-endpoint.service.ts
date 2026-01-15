import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingSpotsGetByIdResponse {
  id: number;
  parkingNumber: number;
  parkingSpotTypeId: number;
  zoneId: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotsGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingSpots`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ParkingSpotsGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
