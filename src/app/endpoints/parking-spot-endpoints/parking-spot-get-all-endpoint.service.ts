import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { Observable } from 'rxjs';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyPagedList } from '../../helper/my-paged-list';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyCacheService } from '../../services/cache-service/my-cache.service';

export interface ParkingSpotsGetAllRequest extends MyPagedRequest {
  q?: string;
  zoneId?: number;
  parkingSpotTypeId?: number;
  isActive?: boolean;
}

export interface ParkingSpotsGetAllResponse {
  id: number;
  parkingNumber: number;
  parkingSpotTypeId: number;
  zoneId: number;
  isActive: boolean;
  latitude?: number;   // dodaj ovo
  longitude?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ParkingSpotsGetAllEndpointService
  implements MyBaseEndpointAsync<ParkingSpotsGetAllRequest, MyPagedList<ParkingSpotsGetAllResponse>> {

  private apiUrl = `${MyConfig.api_address}/ParkingSpots/filter`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(
    request: ParkingSpotsGetAllRequest
  ) {
    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<ParkingSpotsGetAllResponse>>(this.apiUrl, { params });
  }
}
