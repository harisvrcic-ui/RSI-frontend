import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

@Injectable({
  providedIn: 'root',
})
export class ReviewsDeleteEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reviews`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
