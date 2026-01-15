import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyPagedList } from '../../helper/my-paged-list';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface ParkingSpotTypeGetAllRequest extends MyPagedRequest {
  q?: string; // optional filter by name or description
}

export interface ParkingSpotTypeGetAllResponse {
  id: number;
  name: string;
  description: string;
  priceMultiplier: number;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotTypeGetAllEndpointService
  implements MyBaseEndpointAsync<
    ParkingSpotTypeGetAllRequest,
    MyPagedList<ParkingSpotTypeGetAllResponse>
  > {

  private apiUrl = `${MyConfig.api_address}/ParkingSpotTypes/filter`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ParkingSpotTypeGetAllRequest) {
    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<ParkingSpotTypeGetAllResponse>>(this.apiUrl, { params });
  }
}
