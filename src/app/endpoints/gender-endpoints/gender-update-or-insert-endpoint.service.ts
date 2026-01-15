import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface GenderUpdateOrInsertRequest {
  id?: number;
  name: string;
  isActive: boolean;
}

export interface GenderUpdateOrInsertResponse {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GenderUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/genders`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: GenderUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<GenderUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<GenderUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
