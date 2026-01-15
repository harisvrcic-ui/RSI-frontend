import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyConfig} from '../../my-config';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';



export interface LanguageGetByIdResponse {
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
export class LanguageGetByIdEndpointService implements MyBaseEndpointAsync<number, LanguageGetByIdResponse> {
  private apiUrl = `${MyConfig.api_address}/languages`;

  constructor(private httpClient: HttpClient) {
  }

  handleAsync(id: number) {
    return this.httpClient.get<LanguageGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
