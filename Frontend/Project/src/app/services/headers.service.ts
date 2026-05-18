import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment/environment';

export function getPostHeaders(): HttpHeaders {
  return new HttpHeaders({
    Authorization: environment.token,
    'Content-Type': 'application/json'
  });
}
