import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReviewsGetByIdResponse {
  id: number;
  userId: number;
  reservationId: number;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsGetByIdEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reviews`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(id: number) {
    return this.httpClient.get<ReviewsGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
