import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedList } from '../../helper/my-paged-list';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyCacheService } from '../../services/cache-service/my-cache.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Observable} from 'rxjs';


export interface CountryGetAllRequest extends MyPagedRequest {
  q?: string;
  isActive?: boolean;
}

export interface CountryGetAllResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})


export class CountryGetAllEndpointService
  implements MyBaseEndpointAsync<CountryGetAllRequest, MyPagedList<CountryGetAllResponse>>{
  private apiUrl = `${MyConfig.api_address}/countries/filter`;

  constructor(private httpClient: HttpClient, private cacheService: MyCacheService) {}

  handleAsync(
    request: CountryGetAllRequest,
    useCache: boolean = false,
    cacheTTL: number = 300_000
  ) {

    const cacheKey =
      `${request.q || ''}-${request.isActive ?? 'all'}-${request.pageNumber || 1}-${request.pageSize || 10}`;

    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<CountryGetAllResponse>>(cacheKey)!;
      console.log(cacheKey + ' use cached: ' + data.dataItems.length);
      return of(data);  // → NE null, već stvarni MyPagedList
    }

    const params = buildHttpParams(request);

    return this.httpClient.get<MyPagedList<CountryGetAllResponse>>(this.apiUrl, { params }).pipe(
      tap((data) => {
        if (useCache) {
          console.log(cacheKey + ' saving to cache: ' + data.dataItems.length);
          this.cacheService.set(cacheKey, data, cacheTTL);
        }
      })
    );
  }

}


