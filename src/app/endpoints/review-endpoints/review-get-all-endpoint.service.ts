import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import {MyPagedRequest} from '../../helper/my-paged-request';
import { MyPagedList } from '../../helper/my-paged-list';
import { buildHttpParams } from '../../helper/http-params.helper';
import {
  ParkingZonesGetAllRequest,
  ParkingZonesGetAllResponse
} from '../parking-zone-endpoints/parking-zone-get-all-endpoint.service';


export interface ReviewsGetAllRequest extends MyPagedRequest {
  q?: string;
}

export interface ReviewsGetAllResponse {
  id: number;
  userId: number;
  reservationId: number;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsGetAllEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reviews/filter`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ReviewsGetAllRequest) {
    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<ReviewsGetAllResponse>>(this.apiUrl, { params });
  }
}
