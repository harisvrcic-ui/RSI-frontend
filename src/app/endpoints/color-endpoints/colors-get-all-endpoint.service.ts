import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyPagedList } from '../../helper/my-paged-list';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyCacheService } from '../../services/cache-service/my-cache.service';

export interface ColorsGetAllRequest extends MyPagedRequest {
  q?: string;
}

export interface ColorsGetAllResponse {
  id: number;
  name: string;
  hexCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColorsGetAllEndpointService
  implements MyBaseEndpointAsync<ColorsGetAllRequest, MyPagedList<ColorsGetAllResponse>> {

  private apiUrl = `${MyConfig.api_address}/Colors/filter`;

  constructor(
    private httpClient: HttpClient,
    private cacheService: MyCacheService
  ) {}

  handleAsync(
    request: ColorsGetAllRequest,
    useCache: boolean = false,
    cacheTTL: number = 300_000
  ): Observable<MyPagedList<ColorsGetAllResponse>> {

    const cacheKey = `${request.q || ''}-${request.pageNumber || 1}-${request.pageSize || 10}`;

    // Ako postoji cache, vrati ga odmah
    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<ColorsGetAllResponse>>(cacheKey)!;
      return of(data);
    }

    const params = buildHttpParams(request);

    // Fetch from backend
    return this.httpClient.get<MyPagedList<ColorsGetAllResponse>>(this.apiUrl, { params, observe: 'response' }).pipe(
      map((resp: HttpResponse<MyPagedList<ColorsGetAllResponse>>) => {
        // If backend returns 204 or empty body, return default MyPagedList
        if (resp.status === 204 || !resp.body) {
          return {
            dataItems: [],
            totalCount: 0,
            currentPage: request.pageNumber || 1,
            pageSize: request.pageSize || 5,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false
          } as MyPagedList<ColorsGetAllResponse>;
        }
        return resp.body!;
      }),
      tap(data => {
        if (useCache) {
          this.cacheService.set(cacheKey, data, cacheTTL);
        }
      })
    );
  }
}
