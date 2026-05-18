import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../context/context.service';
import { QvdSummaryService } from './qvd_summary.service';
import { filter, switchMap, map, catchError, of, distinctUntilChanged, startWith, } from 'rxjs';

type QvdSummaryVM =
  | { state: 'loading' }
  | { state: 'error'; error: string }
  | { state: 'loaded'; headers: any[]; rows: any[] };


@Component({
  standalone: true,
  selector: 'app-qvd-summary',
  imports: [CommonModule],
  templateUrl: './qvd_summary.html',
  styleUrls: ['./qvd_summary.scss'],
})


export class QvdSummary {

  private context = inject(ContextService);
  private service = inject(QvdSummaryService);

  vm$ = this.context.context$.pipe(
    filter(ctx => !!ctx.core && !!ctx.chip),
    distinctUntilChanged(
      (a, b) => a.core === b.core && a.chip === b.chip
    ),
    switchMap(ctx =>
      this.service.getQvdSummaryData({
        core: ctx.core!.toLowerCase(),
        chip: ctx.chip!,
      }).pipe(
        map((res: any): QvdSummaryVM => {
          console.log('QVD RAW RESPONSE', res);

          const qvd = res?.data?.qvd_summary;

          if (!qvd) {
            return {
              state: 'error',
              error: 'QVD Summary data missing',
            };
          }

          return {
            state: 'loaded',
            headers: qvd.headers ?? [],
            rows: qvd.rowsdata ?? [],
          };
        }),
        startWith({ state: 'loading' } as const),
        catchError(() =>
          of({
            state: 'error',
            error: 'Failed to load QVD Summary data',
          } as const)
        )
      )
    )
  );


  isLoaded(
    vm: QvdSummaryVM
  ): vm is { state: 'loaded'; headers: any[]; rows: any[] } {
    return vm.state === 'loaded';
  }
  

  getValue(row: any, field: string): string {
    const cell = row?.[field];
    if (!cell) return '-';
    if (typeof cell === 'object') {
      return cell.CurrentValue ?? cell.Value ?? '-';
    }
    return String(cell);
  }

  trackByHeader = (_: number, h: any) => h.field ?? h.headerName;
  trackByChild = (_: number, c: any) => c.field;
  trackByRow = (_: number, r: any) => r.qvd_core_name ?? _;
}
