import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarsGetByIdResponse {
  id: number;
  brandId: number;
  brandName: string;
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
export class CarsGetByIdEndpointService implements MyBaseEndpointAsync<number, CarsGetByIdResponse> {
  private apiUrl = `${MyConfig.api_address}/cars`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<CarsGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
