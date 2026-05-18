import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextService } from '../../context/context.service';
import { DvUflowService } from './dv_uflow.service';
import { filter, switchMap, map, catchError, of, distinctUntilChanged, startWith, } from 'rxjs';


type DvHeader = {
    headerName: string;
    field: string;
    name: string;
    hidden?: boolean;
    children?: DvHeader[];
};

type DvUflowVM =
    | { state: 'loading' }
    | { state: 'error'; error: string }
    | {
        state: 'loaded';
        headers: DvHeader[];
        rows: any[];
    };


@Component({
    standalone: true,
    selector: 'app-dv-uflow',
    imports: [CommonModule],
    templateUrl: './dv_uflow.html',
    styleUrls: ['./dv_uflow.scss'],
})


export class DvUflow {
    private context = inject(ContextService);
    private service = inject(DvUflowService);

    vm$ = this.context.context$.pipe(
        filter(ctx => !!ctx.core && !!ctx.chip),
        distinctUntilChanged(
            (a, b) => a.core === b.core && a.chip === b.chip
        ),
        switchMap(ctx =>
            this.service.getDvUflowData({
                core: ctx.core!.toLowerCase(),
                chip: ctx.chip!,
            }).pipe(

                map((res: any): DvUflowVM => {
                    console.log("Shreyasi, testing")
                    console.log('DV UFLOW RAW RESPONSE', res);
                    console.log("Shreyasi, testing2")
                    console.log('DV HEADERS', res.data?.dv_uflow?.headers);
                    console.log("Shreyasi, testing3")
                    console.log('DV ROWS', res.data?.dv_uflow?.rowsdata);
                    console.log('ROW SAMPLE', res.data?.dv_uflow?.rowsdata?.[0]);

                    if (res?.config_available === false) {
                        return {
                            state: 'error',
                            error: 'DV Uflow is not configured for this Core / Chip',
                        };
                    }

                    const dv = res?.data?.dv_uflow;

                    console.log('DV HEADERS', dv?.headers);
                    console.log('DV ROWS', dv?.rowsdata);
                    console.log('ROW SAMPLE', dv?.rowsdata?.[0]);

                    if (!dv) {
                        return {
                            state: 'error',
                            error: 'DV Uflow data missing',
                        };
                    }

                    const headers = dv.headers.map((h: any) => ({
                        headerName: h.key,
                        field: h.name,
                    }));

                    const rows = dv.rowsdata.map((row: any) => {
                        const flatRow: any = {};

                        headers.forEach((h: any) => {
                            const cell = row[h.field];

                            if (!cell) {
                                flatRow[h.field] = '-';
                                return;
                            }

                            let value = cell.CurrentValue ?? cell.Value;

                            if (!value || value === '-') {
                                flatRow[h.field] = '-';
                                return;
                            }

                            if (typeof value === 'string' && value.startsWith('{')) {
                                try {
                                    const parsed = JSON.parse(value.replace(/'/g, '"'));
                                    flatRow[h.field] = parsed.state ?? value;
                                    return;
                                } catch {
                                    flatRow[h.field] = value;
                                    return;
                                }
                            }

                            flatRow[h.field] = value;
                        });

                        return flatRow;
                    });

                    return {
                        state: 'loaded',
                        headers,
                        rows,
                    };
                }),

                    startWith({ state: 'loading' } as const),

                        catchError(() =>
                            of({
                                state: 'error',
                                error: 'Failed to load DV Uflow data',
                            } as const)
                        )
            )
            )
        );


    isLoaded(vm: DvUflowVM): vm is { state: 'loaded'; headers: DvHeader[]; rows: any[] } {
        return vm.state === 'loaded';
    }

    getValue(row: any, field: string): string {
        const cell = row?.[field];

        if (!cell) return '-';
        console.log(field, cell);


        let value = cell.CurrentValue ?? cell.Value;

        if (!value || value === '-') return '-';

        if (Array.isArray(value)) {
            return value.join(', ');
        }

        if (typeof value === 'string' && value.startsWith('{')) {
            try {
                const json = JSON.parse(value.replace(/'/g, '"'));

                console.log("RETURN:", value);
                if (json.state) return json.state;

                return JSON.stringify(json); // fallback
            } catch {
                return value;
            }
        }

        return value.toString();
    }

    trackByHeader = (_: number, h: DvHeader) => h.field;
    trackByRow = (index: number, r: any) => r.core_name?.CurrentValue ?? index;
    trackByChild = (_: number, c: DvHeader) => c.field;
}