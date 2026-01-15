import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyPagedList } from '../../helper/my-paged-list';
import { MyCacheService } from '../../services/cache-service/my-cache.service';
import { of, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface GenderGetAllRequest extends MyPagedRequest {
  q?: string;
  isActive?: boolean;
}

export interface GenderGetAllResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GenderGetAllEndpointService implements MyBaseEndpointAsync<GenderGetAllRequest, MyPagedList<GenderGetAllResponse>> {

  private apiUrl = `${MyConfig.api_address}/genders/filter`;

  constructor(private httpClient: HttpClient, private cacheService: MyCacheService) {}

  handleAsync(
    request: GenderGetAllRequest = { pageNumber: 1, pageSize: 10 },
    useCache: boolean = true,
    cacheTTL: number = 300_000
  ): Observable<MyPagedList<GenderGetAllResponse>> {

    const cacheKey = `genders-${request.q || ''}-${request.pageNumber}-${request.pageSize}`;

    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<GenderGetAllResponse>>(cacheKey)!;
      return of(data);
    }

    const params = buildHttpParams(request);

    return this.httpClient.get<MyPagedList<GenderGetAllResponse>>(this.apiUrl, { params }).pipe(
      tap(data => {
        if (useCache) {
          this.cacheService.set(cacheKey, data, cacheTTL);
        }
      })
    );
  }
}
