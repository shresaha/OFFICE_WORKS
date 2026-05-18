import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class DragonGateService {

  constructor(private http: HttpClient) {}


getDragonGateData(ctx: any) {
  return this.http.post(environment.dragonGateUrl, {
    "core_name": ctx.core,
    "chip_name": ctx.chip,       
  });
} 
}