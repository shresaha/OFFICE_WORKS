import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TableGridResponse } from './table.models';

@Injectable({
  providedIn: 'root',
})


export class TableService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getTableGrid(): Observable<TableGridResponse> {
    return this.http.get<TableGridResponse>(
      `${this.baseUrl}/table/grid`
    );
  }


  createCore(coreName: string) {
    return this.http.post(
      `${this.baseUrl}/table/cores`,
      { name: coreName }
    );
  }


  updateCell(payload: {
    core_name: string;
    system_heading_id: string;
    value: string | null;
  }): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/table/cells`,
      payload
    );
  }


  updateCore(coreId: string, name: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/table/cores/${coreId}`,
      { name }
    );
  }


  deleteCore(coreId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/table/cores/${coreId}`
    );
  }


  updateColumn(columnId: string, name: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/table/columns/${columnId}`,
      { name }
    );
  }

  
  deleteColumn(columnId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/table/columns/${columnId}`
    );
  }
}
