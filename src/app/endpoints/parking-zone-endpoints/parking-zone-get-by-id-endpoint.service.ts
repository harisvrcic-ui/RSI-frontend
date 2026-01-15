import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ParkingZonesGetByIdResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingZonesGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingZones`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ParkingZonesGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}


