import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';

export interface ReviewsUpdateOrInsertRequest {
  id?: number;
  userId: number;
  reservationId: number;
  rating: number;
  comment: string;
}

export interface ReviewsUpdateOrInsertResponse {
  id: number;
  userId: number;
  reservationId: number;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsUpdateOrInsertEndpointService {
  private apiUrl = `${MyConfig.api_address}/Reviews`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: ReviewsUpdateOrInsertRequest) {
    if (request.id && request.id > 0) {
      return this.httpClient.put<ReviewsUpdateOrInsertResponse>(
        `${this.apiUrl}/${request.id}`,
        request
      );
    } else {
      return this.httpClient.post<ReviewsUpdateOrInsertResponse>(
        this.apiUrl,
        request
      );
    }
  }
}
