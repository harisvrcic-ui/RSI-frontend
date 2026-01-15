import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingSpotTypeGetByIdResponse {
  id: number;
  name: string;
  description: string;
  priceMultiplier: number;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotTypeGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingSpotTypes`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ParkingSpotTypeGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
