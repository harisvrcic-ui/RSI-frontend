import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingSpotTypeUpdateOrInsertRequest {
  id?: number;
  name: string;
  description: string;
  priceMultiplier: number;
}

export interface ParkingSpotTypeUpdateOrInsertResponse {
  id: number;
  name: string;
  description: string;
  priceMultiplier: number;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotTypeUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingSpotTypes`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ParkingSpotTypeUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ParkingSpotTypeUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ParkingSpotTypeUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
