import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyPagedList } from '../../helper/my-paged-list';
import { buildHttpParams } from '../../helper/http-params.helper';

export interface ParkingZonesGetAllRequest extends MyPagedRequest {
  q?: string;
}

export interface ParkingZonesGetAllResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingZonesGetAllEndpointService {
  private apiUrl = `${MyConfig.api_address}/ParkingZones/filter`; // ✔ mora imati /filter

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ParkingZonesGetAllRequest) {
    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<ParkingZonesGetAllResponse>>(this.apiUrl, { params });
  }
}
