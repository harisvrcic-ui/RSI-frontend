import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface ColorsUpdateOrInsertRequest {
  id?: number | null;
  name: string;
  hexCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColorsUpdateOrInsertEndpointService implements MyBaseEndpointAsync<ColorsUpdateOrInsertRequest, void> {
  private apiUrl = `${MyConfig.api_address}/Colors`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ColorsUpdateOrInsertRequest) {
    return this.httpClient.post<void>(this.apiUrl, request);
  }
}
