import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})


export class QvdSummaryService {
  constructor(private http: HttpClient) {}

  getQvdSummaryData(ctx: { core: string; chip: string }) {
    return this.http.post(environment.qvdSummaryUrl, {
      core_name: ctx.core,
      chip_name: ctx.chip,
    });
  }
}