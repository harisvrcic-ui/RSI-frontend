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
  name?: string;
  /** 1 = Zona 1 (Vijećnica, Baščaršija), 2 = Zona 2 (Aria) */
  zoneGroup?: number;
  zoneId?: number;
  onlyAvailable?: boolean;
  openNow?: boolean;
  sortBy?: string;
  parkingSpotTypeId?: number;
  isActive?: boolean;
}

export interface ParkingSpotsGetAllResponse {
  id: number;
  parkingNumber: number;
  parkingSpotTypeId: number;
  zoneId: number;
  zoneName?: string;
  /** Naziv lokacije iz baze (Aria mall, Vijećnica, Baščaršija) – za pretragu i prikaz. */
  displayName?: string | null;
  isActive: boolean;
  latitude?: number;
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
    let params = buildHttpParams(request);
    if (request.zoneGroup != null && request.zoneGroup !== undefined) {
      params = params.set('zoneGroup', String(request.zoneGroup));
    }
    if (request.name != null && request.name !== undefined && String(request.name).trim() !== '') {
      params = params.set('name', String(request.name).trim());
    }
    return this.httpClient.get<MyPagedList<ParkingSpotsGetAllResponse>>(this.apiUrl, { params });
  }
}
