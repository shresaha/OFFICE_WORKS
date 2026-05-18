import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root',
})
export class CoreChipService {
  constructor(private http: HttpClient) { }


  getCores() {
    return this.http.get<any>(environment.coreUrl).pipe(
      map(res =>
        res.data.map((c: any) => ({
          name: c.display_name
        }))
      )
    );
  }


  getChips(core: string) {
    return this.http.get<any>(
      `${environment.chipUrl}?core=${encodeURIComponent(core)}`
    ).pipe(
      map(res => {
        console.log(' RAW CHIP RESPONSE:', res);
        const chips = res?.chips ?? [];

        return chips.map((c: any) => ({
          name: c.display_name,   
          value: c.chip_name     
        }));
      })
    );
  }
}