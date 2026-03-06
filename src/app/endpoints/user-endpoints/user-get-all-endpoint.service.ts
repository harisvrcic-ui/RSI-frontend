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

export interface UserGetAllRequest extends MyPagedRequest {
  q?: string;
  isAdmin?: boolean;
  isUser?: boolean;
  isActive?: boolean;
}

export interface UserGetAllResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isAdmin: boolean;
  isUser: boolean;
  genderName: string;
  cityName: string;
  createdAt: string;
  failedLoginAttempts: number;
  isLocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserGetAllEndpointService implements MyBaseEndpointAsync<UserGetAllRequest, MyPagedList<UserGetAllResponse>> {
  private apiUrl = `${MyConfig.api_address}/users/filter`;

  constructor(private httpClient: HttpClient, private cacheService: MyCacheService) {
  }

  handleAsync(request: UserGetAllRequest, useCache: boolean = false, cacheTTL: number = 300000) {

    const cacheKey = `${request.q || ''}-${request.isAdmin || ''}-${request.isUser || ''}-${request.isActive || ''}-${request.pageNumber || 1}-${request.pageSize || 10}`;
    // Check if cached version exists
    if (useCache && this.cacheService.has(cacheKey)) {
      const data = this.cacheService.get<MyPagedList<UserGetAllResponse>>(cacheKey)!;
      return of(data);
    }

    const params = buildHttpParams(request);  // Use the helper function here
    return this.httpClient.get<MyPagedList<UserGetAllResponse>>(`${this.apiUrl}`, {params}).pipe(
      tap((data) => {
        if (useCache) {
          this.cacheService.set(cacheKey, data, cacheTTL);
        }
      }));
  }
}
