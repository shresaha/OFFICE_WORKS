import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from './table.service';
import { map, startWith, catchError, of, forkJoin, switchMap, Subject, finalize, BehaviorSubject } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './table.html',
  styleUrls: ['./table.scss'],
})


export class Table {
  private tableService = inject(TableService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private refresh$ = new Subject<void>();

  headers: any[] = [];

  vm$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() =>
      this.tableService.getTableGrid().pipe(
        map(res => {
          this.headers = res.headers;
          return { state: 'loaded' as const, data: res };
        }),
        startWith({ state: 'loading' as const }),
        catchError(() =>
          of({
            state: 'error' as const,
            error: 'Failed to load table data',
          })
        )
      )
    )
  );


  isEditOpen = false;
  isAddMode = false;
  saving = false;
  saveAttempted = false;

  form!: FormGroup;
  selectedRow: any = null;

  saving$ = new BehaviorSubject<boolean>(false)


  onEditRow(row: any, headers: any[]): void {
    this.isAddMode = false;
    this.isEditOpen = true;
    this.saveAttempted = false;
    this.selectedRow = row;

    const valuesGroup: Record<string, any> = {};
    headers.forEach(h => {
      valuesGroup[h.id] = [row.values[h.id] ?? ''];
    });

    this.form = this.fb.group({
      coreName: [row.core_name, Validators.required],
      values: this.fb.group(valuesGroup),
    });

    this.clearDuplicateOnChange();
  }


  openAddModal(headers: any[]): void {
    this.isAddMode = true;
    this.isEditOpen = true;
    this.saveAttempted = false;
    this.selectedRow = null;

    const valuesGroup: Record<string, any> = {};
    headers.forEach(h => {
      valuesGroup[h.id] = [''];
    });

    this.form = this.fb.group({
      coreName: ['', Validators.required],
      values: this.fb.group(valuesGroup),
    });

    this.clearDuplicateOnChange();
  }


  saveEdit(headers: any[]): void {
    this.saveAttempted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isAddMode && this.form.pristine) {
      return;
    }

    const { coreName, values } = this.form.getRawValue();

    this.saving$.next(true);

    const save$ = this.isAddMode
      ? this.createCoreAndCells$(headers, values, coreName)
      : this.updateCoreAndCells$(headers, values, coreName);

    save$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.finishSave(),
        error: err => this.handleSaveError(err),
      });
  }


  private createCoreAndCells$(headers: any[], values: any, coreName: string) {
    return this.tableService.createCore(coreName).pipe(
      switchMap(() => this.updateCells$(headers, values, coreName))
    );
  }


  private updateCoreAndCells$(headers: any[], values: any, coreName: string) {

    if (coreName !== this.selectedRow.core_name) {
      return this.tableService.updateCore(
        this.selectedRow.id ?? this.selectedRow._id,
        coreName
      );
    }

    return this.updateCells$(headers, values, this.selectedRow.core_name);
  }


  private updateCells$(headers: any[], values: any, coreName: string) {
    const requests = headers.map(h =>
      this.tableService.updateCell({
        core_name: coreName,
        system_heading_id: h.id,
        value: values[h.id] || null,
      })
    );

    return forkJoin(requests);
  }

  isDeleteOpen = false;
  rowToDelete: any = null;


onDeleteClick(row: any): void {
  this.rowToDelete = row;
  this.isDeleteOpen = true;
}


closeDelete(): void {
  this.isDeleteOpen = false;
  this.rowToDelete = null;
  
}


confirmDelete(): void {
  if (!this.rowToDelete?.core_id) return;

  this.tableService.deleteCore(this.rowToDelete.core_id).subscribe({
    next: () => {
      
      this.closeDelete();

      this.vm$ = this.tableService.getTableGrid().pipe(
        map(res => ({ state: 'loaded' as const, data: res })),
        startWith({ state: 'loading' as const })
      );
    },
    error: () => {
      
      console.error('Delete failed');
    },
  });
}


  private handleSaveError(err: any): void {
    const message =
      err?.error?.message ||
      err?.error?.detail ||
      err?.error?.error ||
      err?.message ||
      '';

    if (
      message.toLowerCase().includes('exist') ||
      message.toLowerCase().includes('duplicate') ||
      message.toLowerCase().includes('already')
    ) {
      const control = this.form.get('coreName');
      control?.setErrors({ duplicate: true });
      control?.markAsTouched();
      return;
    }

    this.snackBar.open(
      'Something went wrong while saving',
      'Close',
      { duration: 3000 }
    );
  }


  private clearDuplicateOnChange(): void {
    this.form.get('coreName')?.valueChanges.subscribe(() => {
      const control = this.form.get('coreName');
      if (control?.hasError('duplicate')) {
        control.setErrors(null);
      }
    });
  }


  private finishSave(): void {
    this.closeEdit();
    this.refresh$.next();

    this.snackBar.open(
      'Saved successfully',
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar'],
      }
    );
  }


  closeEdit(): void {
    this.isEditOpen = false;
    this.isAddMode = false;
    this.form = null as any;
    this.selectedRow = null;
    this.saveAttempted = false;
  }


  trackById(_: number, item: { id: string }) {
    return item.id;
  }
}
