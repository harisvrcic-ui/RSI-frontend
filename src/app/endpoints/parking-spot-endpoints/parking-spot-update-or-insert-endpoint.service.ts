import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingSpotsUpdateOrInsertRequest {
  id?: number;
  parkingNumber: number;
  parkingSpotTypeId: number;
  zoneId: number;
  isActive: boolean;
}

export interface ParkingSpotsUpdateOrInsertResponse {
  id: number;
  parkingNumber: number;
  parkingSpotTypeId: number;
  zoneId: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotsUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingSpots`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ParkingSpotsUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ParkingSpotsUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ParkingSpotsUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
