import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, catchError, of, distinctUntilChanged, filter, switchMap, startWith } from 'rxjs';
import { CoreChipService } from '../services/core_chip.service';
import { ContextService } from '../context/context.service';
import { FormsModule } from '@angular/forms';
import { DragonGateService } from '../tabs/dragonGate/dragonGate.service';
import { DvUflowService } from '../tabs/dv_uflow/dv_uflow.service';
import { QvdSummaryService } from '../tabs/qvd_summary/qvd_summary.service';
import { DvUflow } from "../tabs/dv_uflow/dv_uflow";
import { DragonGate } from "../tabs/dragonGate/dragonGate";
import { QvdSummary } from "../tabs/qvd_summary/qvd_summary";

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule, DvUflow, DragonGate, QvdSummary],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})

export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  private contextService = inject(ContextService);
  private coreChipService = inject(CoreChipService);

  private dragonGateService = inject(DragonGateService);

  private dvUflowService = inject(DvUflowService);

  private qvdSummaryService = inject(QvdSummaryService);


  private extractValue(cell: any): string {
    if (cell == null) return '-';

    if (typeof cell === 'object') {
      return (
        cell.CurrentValue ??
        cell.Value ??
        cell.value ??
        '-'
      );
    }

    return String(cell);
  }


  coreList: { id: string; name: string }[] = [];
  chipList: { name: string; value: string }[] = [];


  dragonGateData: any[] = [];
  dragonGateLoading = false;
  dragonGateError: string | null = null;


  selectedCore: string | null = null;
  selectedChip: string | null = null;

  activeTab: 'dragon' | 'dv' | 'qvd' | null = null;


  user$ = this.auth.getCurrentUser().pipe(
    map((user: any) => {
      const fullName = user?.name?.trim() || '';
      return fullName.split(' ')[0];
    }),
    catchError(() => of(null))
  );


  showConfirm = false;
  selectedProgram: string | null = null;
  selectedPhase: string | null = null;


  constructor() {
    this.loadCores();
  }

  
  isOnTablePage = this.router.url.includes('/dashboard/table');

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isOnTablePage =
        event.urlAfterRedirects.includes('/dashboard/table');
    }
  });
  }


  openLogoutModal() {
    this.showConfirm = true;
  }


  cancelLogout() {
    this.showConfirm = false;
  }


  confirmLogout() {
    this.showConfirm = false;
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }


  private loadCores(): void {
    this.coreChipService.getCores().subscribe({
      next: (res: any[]) => {
        this.coreList = res;
      },
      error: () => console.error('Failed to load cores'),
    });
  }


  onCoreChange(core: string): void {

    console.log('Core changed to:', core);

    this.selectedCore = core;
    this.selectedChip = null;
    this.chipList = [];

    if (!core) {
      return;
    }

    this.contextService.setCore(core);

    this.coreChipService.getChips(core).subscribe({
      next: (res) => {
        this.chipList = res;
      },
      error: (err) => {
        console.error('Failed to load chips', err);
      }
    });
  }


  onChipChange(chipValue: string): void {
    if (!chipValue) {
      return;
    }

    this.selectedChip = chipValue;
    this.contextService.setChip(chipValue);

    if (!this.selectedProgram) {
      this.selectedProgram = 'Zealis';
      this.contextService.setProgram(this.selectedProgram);
    }

    if (!this.selectedPhase) {
      this.selectedPhase = 'P3';
      this.contextService.setPhase(this.selectedPhase);
    }

    console.log('[DG CONTEXT AFTER CHIP]', {
      core: this.selectedCore,
      chip: this.selectedChip,
      program: this.selectedProgram,
      phase: this.selectedPhase
    });
  }


  dragonGateVm$ = this.contextService.context$.pipe(
    filter(ctx => !!ctx.core && !!ctx.chip),
    distinctUntilChanged(
      (a, b) => a.core === b.core && a.chip === b.chip
    ),
    switchMap(ctx =>
      this.dragonGateService.getDragonGateData({
        core: ctx.core!.toLowerCase(),
        chip: ctx.chip!,
      })
    ),
    map((res: any) => {
      console.log('DragonGate API RESPONSE', res);

      const dg = res?.dragon_gate ?? res?.data?.dragon_gate;
      if (!dg) {
        return { state: 'error', rows: [] };
      }

      return {
        state: 'loaded',
        rows: dg.rowsdata.map((row: any) => ({
          coreName: this.extractValue(row.core_name),
          currentOpenCR: this.extractValue(row.current_open_cr),
          currentClosedCR: this.extractValue(row.current_closed_cr),
          crTrend: this.extractValue(row.cr_trend),
          cqProjectExists: row.cq_project_exists,
          cqPcrDate: this.extractValue(row.cq_pcr_date),
          clearcaseBaseline: this.extractValue(row.clearcase_baseline),
          ccProject: this.extractValue(row.cc_project),
          releaseDate: this.extractValue(row.release_date),
          releaseOwner: this.extractValue(row.release_owner),
          pState: this.extractValue(row.p_state),
          isLibrary: row.is_library
        }))
      };
    }),
    startWith({ state: 'loading', rows: [] }),
    catchError(err => {
      console.error(err);
      return of({ state: 'error', rows: [] });
    })
  );


  dvVm$ = this.contextService.context$.pipe(
    filter(ctx => !!ctx.core && !!ctx.chip),
    distinctUntilChanged(
      (a, b) => a.core === b.core && a.chip === b.chip
    ),
    switchMap(ctx =>
      this.dvUflowService.getDvUflowData({
        core: ctx.core!.toLowerCase(),
        chip: ctx.chip!
      })
    ),
    map((res: any) => {
      console.log('DV UFLOW API RESPONSE', res);

      if (res?.config_available === false) {
        return { state: 'loaded', rows: [] };
      }

      const dv = res?.data?.dv_uflow;
      if (!dv || !Array.isArray(dv.rowsdata)) {
        return { state: 'loaded', rows: [] };
      }

      return {
        state: 'loaded',
        rows: dv.rowsdata.map((row: any) => ({
          coreName: this.extractValue(row.core_name),
          dl: this.extractValue(row.dl),
          bestQState: this.extractValue(row.best_q_state),
          latestQState: this.extractValue(row.latest_q_state),
          q1: this.extractValue(row.q1),
          q2: this.extractValue(row.q2),
          q3: this.extractValue(row.q3),
        }))
      };
    }),
    startWith({ state: 'loading', rows: [] }),
    catchError(() => of({ state: 'error', rows: [] }))
  );


  qvdVm$ = this.contextService.context$.pipe(
    filter(ctx => !!ctx.core && !!ctx.chip),
    distinctUntilChanged(
      (a, b) => a.core === b.core && a.chip === b.chip
    ),
    switchMap(ctx =>
      this.qvdSummaryService.getQvdSummaryData({
        core: ctx.core!.toLowerCase(),
        chip: ctx.chip!
      })
    ),
    map((res: any) => {
      console.log('QVD SUMMARY API RESPONSE', res);

      const qvd = res?.data?.qvd_summary ?? res?.qvd_summary;
      if (!qvd || !Array.isArray(qvd.rowsdata)) {
        return { state: 'loaded', rows: [] };
      }

      return {
        state: 'loaded',
        rows: qvd.rowsdata.map((row: any) => ({
          coreName: this.extractValue(row.core_name),
          dl: this.extractValue(row.dl),
          dvOwner: this.extractValue(row.dv_owner),
          lineCov: this.extractValue(row.line_cov),
          branchCov: this.extractValue(row.branch_cov),
          exprCov: this.extractValue(row.expression_cov),
          toggleCov: this.extractValue(row.toggle_cov),
          functionalCov: this.extractValue(row.functional_cov),
          q1: this.extractValue(row.q1),
          q2: this.extractValue(row.q2),
          q3: this.extractValue(row.q3),
          hpg: this.extractValue(row.hpg),
          latestState: this.extractValue(row.latest_state),
          report: this.extractValue(row.report),
        }))
      };
    }),
    startWith({ state: 'loading', rows: [] }),
    catchError(() => of({ state: 'error', rows: [] }))
  );


  isContextReady(): boolean {
    return !!this.selectedCore && !!this.selectedChip;
  }


  setActiveTab(tab: 'dragon' | 'dv' | 'qvd'): void {
    if (!this.isContextReady()) return;
    this.activeTab = tab;
  }


  get activeTabLabel(): string {
    switch (this.activeTab) {
      case 'dragon':
        return 'Dragon Gate';
      case 'dv':
        return 'DV Uflow';
      case 'qvd':
        return 'QVD Summary';
      default:
        return '';
    }
  }

  trackByCore = (_: number, core: { id?: string; name: string }) => core.name;

}
