import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyPagedList } from '../../helper/my-paged-list';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyCacheService } from '../../services/cache-service/my-cache.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CarsGetAllRequest extends MyPagedRequest {
  q?: string;
  brandId?: number;
  isActive?: boolean;
  userId?: number;
}

export interface CarsGetAllResponse {
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
export class CarsGetAllEndpointService implements MyBaseEndpointAsync<CarsGetAllRequest, MyPagedList<CarsGetAllResponse>> {
  private apiUrl = `${MyConfig.api_address}/Cars/filter`;

  constructor(private httpClient: HttpClient, private cacheService: MyCacheService) {}

  handleAsync(request: CarsGetAllRequest, useCache: boolean = false, cacheTTL: number = 300000) {
    const cacheKey = `cars-${request.q ?? ''}-${request.brandId ?? ''}-${request.pageNumber ?? 1}-${request.pageSize ?? 10}`;

    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<CarsGetAllResponse>>(cacheKey)!;
      return of(data);
    }

    const params = buildHttpParams(request);
    return this.httpClient.get<MyPagedList<CarsGetAllResponse>>(this.apiUrl, { params }).pipe(
      tap(data => {
        if (useCache) this.cacheService.set(cacheKey, data, cacheTTL);
      })
    );
  }
}
