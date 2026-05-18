import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppContext {
 
  core: string | null;
  chip: string | null;
  program: string | null;
  phase: string | null;

}

@Injectable({
  providedIn: 'root',
})


export class ContextService {
  private contextSubject = new BehaviorSubject<AppContext>({
    core: null,
    chip: null,
    program: null,
    phase: null,
  });

  context$ = this.contextSubject.asObservable();


  setCore(core: string | null): void {
    const current = this.contextSubject.value;
    this.contextSubject.next({
      ...current,
      core,
    });
  };


  setChip(chip: string | null): void {
    const current = this.contextSubject.value;
    this.contextSubject.next({
      ...current,
      chip,
    });
  };


  setProgram(program: string | null): void {
    const current = this.contextSubject.value;
    this.contextSubject.next({
      ...current,
      program,
    });
  };
  

  setPhase(phase: string | null): void {
    const current = this.contextSubject.value;
    this.contextSubject.next({
      ...current,
      phase,
    });
  }
  

  isContextComplete(): boolean {
  const { core, chip, program, phase } = this.contextSubject.value;
  return !!core && !!chip && !!program && !!phase;
}
}
