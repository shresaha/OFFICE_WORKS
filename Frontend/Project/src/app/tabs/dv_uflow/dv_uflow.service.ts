import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})


export class DvUflowService {
  constructor(private http: HttpClient) {}

  getDvUflowData(ctx: { core: string; chip: string }) {
    return this.http.post(environment.dvUflowUrl, {
      core_name: ctx.core,
      chip_name: ctx.chip,
    });
  }
}
