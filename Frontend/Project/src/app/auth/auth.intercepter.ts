import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const securedApis = [
      '/dragon-gate',
      '/dv-uflow',
      '/qvd-summary',
    ];

    const requiresAuth = securedApis.some(api =>
      req.url.includes(api)
    );

    if (!requiresAuth) {
      return next.handle(req);
    }

    const token = environment.token;

    if (!token) {
      console.warn('Auth token missing for secured API');
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq);
  }
}