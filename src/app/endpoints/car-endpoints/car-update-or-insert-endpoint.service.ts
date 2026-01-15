import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarsUpdateOrInsertRequest {
  id?: number | null;
  brandId: number;
  colorId: number;
  userId: number;
  model: string;
  licensePlate: string;
  yearOfManufacture: number;
  isActive: boolean;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarsUpdateOrInsertEndpointService implements MyBaseEndpointAsync<CarsUpdateOrInsertRequest, void> {
  private apiUrl = `${MyConfig.api_address}/cars`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: CarsUpdateOrInsertRequest) {
    return this.httpClient.post<void>(this.apiUrl, request);
  }
}
