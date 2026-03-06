import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { MyConfig } from '../../my-config';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyPagedList } from '../../helper/my-paged-list';
import { MyCacheService } from '../../services/cache-service/my-cache.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface BrandGetAllRequest extends MyPagedRequest {
  q?: string;
  isActive?: boolean;
}

export interface BrandGetAllResponse {
  id: number;
  name: string;
  logo?: string;      // base64
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandGetAllEndpointService
  implements MyBaseEndpointAsync<BrandGetAllRequest, MyPagedList<BrandGetAllResponse>> {

  private apiUrl = `${MyConfig.api_address}/brands/filter`;

  constructor(
    private httpClient: HttpClient,
    private cacheService: MyCacheService
  ) {}

  handleAsync(
    request: BrandGetAllRequest,
    useCache: boolean = false,
    cacheTTL: number = 300000
  ) {

    const cacheKey =
      `${request.q || ''}-${request.isActive ?? 'all'}-${request.pageNumber || 1}-${request.pageSize || 10}`;

    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<BrandGetAllResponse>>(cacheKey)!;
      return of(data);
    }

    const params = buildHttpParams(request);

    return this.httpClient
      .get<MyPagedList<BrandGetAllResponse>>(this.apiUrl, { params })
      .pipe(
        tap((data) => {
          if (useCache) {
            this.cacheService.set(cacheKey, data, cacheTTL);
          }
        })
      );
  }
}
