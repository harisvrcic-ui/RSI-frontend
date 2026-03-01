import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReservationTypeGetAllRequest {
  pageNumber: number;
  pageSize: number;
  q?: string;
}

export interface ReservationTypeGetAllResponse {
  id: number;
  name: string;
  price: number;
}

export interface MyPagedList<T> {
  dataItems: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationTypeGetAllEndpointService {
  private apiUrl = `${MyConfig.api_address}/ReservationTypes/filter`;

  constructor(private http: HttpClient) {}

  handleAsync(request: ReservationTypeGetAllRequest) {
    let params = new HttpParams()
      .set('pageNumber', String(request.pageNumber))
      .set('pageSize', String(request.pageSize));

    if (request.q) {
      params = params.set('q', request.q);
    }

    return this.http.get<MyPagedList<ReservationTypeGetAllResponse>>(this.apiUrl, { params });
  }
}
