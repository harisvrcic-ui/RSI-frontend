import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingZonesUpdateOrInsertRequest {
  id?: number;
  name: string;
  isActive: boolean;
}

export interface ParkingZonesUpdateOrInsertResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingZonesUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingZones`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ParkingZonesUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ParkingZonesUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ParkingZonesUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
