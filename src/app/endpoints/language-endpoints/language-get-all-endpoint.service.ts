import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyPagedRequest} from '../../helper/my-paged-request';
import {MyConfig} from '../../my-config';
import {buildHttpParams} from '../../helper/http-params.helper';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyPagedList} from '../../helper/my-paged-list';
import {MyCacheService} from '../../services/cache-service/my-cache.service';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface LanguageGetAllRequest extends MyPagedRequest {
  q?: string;
}

export interface LanguageGetAllResponse {
  id: number;
  name: string;
  nativeName?: string;
  code?: string;

  createdAt: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageGetAllEndpointService implements MyBaseEndpointAsync<LanguageGetAllRequest, MyPagedList<LanguageGetAllResponse>> {
  private apiUrl = `${MyConfig.api_address}/languages/filter`;

  constructor(private httpClient: HttpClient, private cacheService: MyCacheService) {
  }

  handleAsync(request: LanguageGetAllRequest, useCache: boolean = false, cacheTTL: number = 300000) {

    const cacheKey = `languages-${request.q || ''}-${request.pageNumber || 1}-${request.pageSize || 10}`;
    // Provjeri da li postoji keširana verzija
    if (useCache && this.cacheService.has(cacheKey)) {
      let data = this.cacheService.get<MyPagedList<LanguageGetAllResponse>>(cacheKey)!;
      console.log(cacheKey + " use cached: " + data.dataItems.length)
      return of(data);
    }

    const params = buildHttpParams(request);  // Use the helper function here
    return this.httpClient.get<MyPagedList<LanguageGetAllResponse>>(`${this.apiUrl}`, {params}).pipe(
      tap((data) => {
        if (useCache) {
          console.log(cacheKey + " saving to cache: " + data.dataItems.length)
          this.cacheService.set(cacheKey, data, cacheTTL);
        }
      }));
  }
}
