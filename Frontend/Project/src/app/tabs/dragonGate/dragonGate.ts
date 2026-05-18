import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../context/context.service';
import { DragonGateService } from './dragonGate.service';
import { filter, switchMap, map, catchError, of, distinctUntilChanged, startWith } from 'rxjs';
import { Observable } from 'rxjs';


type DragonGateVM =
  | { state: 'loading' }
  | { state: 'error'; error: string }
  | { state: 'loaded'; headers: any[]; rows: any[] };


@Component({
  standalone: true,
  selector: 'app-dragon-gate',
  imports: [CommonModule],
  templateUrl: './dragonGate.html',
  styleUrls: ['./dragonGate.scss'],
})


export class DragonGate {

  private context = inject(ContextService);
  private service = inject(DragonGateService);

  vm$: Observable<DragonGateVM> = this.context.context$.pipe(

    filter(ctx => !!ctx.core && !!ctx.chip),
    distinctUntilChanged(
      (a, b) => a.core === b.core && a.chip === b.chip
    ),
    switchMap(ctx =>
      this.service.getDragonGateData({
        core: ctx.core!.toLowerCase(),
        chip: ctx.chip!,
      }).pipe(
        map((res: any): DragonGateVM => {
          console.log('FULL RESPONSE', res);

          const dg = res?.dragon_gate ?? res?.data?.dragon_gate;

          console.log('dragon_gate', dg);
          console.log('HEADERS IS ARRAY?', Array.isArray(dg?.headers), dg?.headers);
          console.log('ROWSDATA IS ARRAY?', Array.isArray(dg?.rowsdata), dg?.rowsdata);

          if (!dg) {
            return { state: 'error', error: 'Dragon Gate data missing' };
          }

          return {
            state: 'loaded',
            headers: dg.headers ?? [],
            rows: dg.rowsdata ?? [],
          };
        }),


        startWith<DragonGateVM>({ state: 'loading' }),

        catchError(() =>
          of<DragonGateVM>({
            state: 'error',
            error: 'Failed to load Dragon Gate data',
          })
        )
      )
    )
  );


  isLoaded(
    vm: DragonGateVM
  ): vm is { state: 'loaded'; headers: any[]; rows: any[] } {
    return vm.state === 'loaded';
  }


  getValue(row: any, field: string): string {
    const cell = row?.[field];
    if (cell == null) return '-';
    if (typeof cell === 'boolean') return cell ? 'True' : 'False';
    if (typeof cell === 'object') {
      return cell.CurrentValue ?? cell.Value ?? '-';
    }
    return String(cell);
  }


  trackByHeader = (_: number, header: any) => header.field;
  trackByChild = (_: number, child: any) => child.field;
  trackByRow = (_: number, row: any) => row.core_name ?? _;
}

