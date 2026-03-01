import {HttpParams} from '@angular/common/http';

export function buildHttpParams<T extends Record<string, any>>(requestObject: T): HttpParams {
  let params = new HttpParams();

  Object.entries(requestObject).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const s = value.toString();
    if (s === '') return;
    params = params.set(key, s);
  });

  return params;
}
