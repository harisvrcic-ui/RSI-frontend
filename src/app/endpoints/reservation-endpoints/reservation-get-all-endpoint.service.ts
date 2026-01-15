import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyPagedList } from '../../helper/my-paged-list';
import { buildHttpParams } from '../../helper/http-params.helper';

export interface ReservationsGetAllRequest extends MyPagedRequest {
  q?: string; // optional search/filter
}

export interface ReservationsGetAllResponse {
  id: number;
  carID: number;
  parkingSpotID: number;
  reservationTypeID: number;
  startDate: string; // ili Date, zavisi šta backend vraća
  endDate: string;
  finalPrice: number;

}

@Injectable({
  providedIn: 'root',
})
export class ReservationsGetAllEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reservations/filter`; // ✔ koristi /filter kao na ParkingZones

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ReservationsGetAllRequest) {
    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<ReservationsGetAllResponse>>(this.apiUrl, { params });
  }
}
