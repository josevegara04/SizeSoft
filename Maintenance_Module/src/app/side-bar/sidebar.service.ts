import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private logsSubject = new BehaviorSubject<string[]>([]);
  logs$ = this.logsSubject.asObservable();

  addLog(message: string) {
    const current = this.logsSubject.value;
    this.logsSubject.next([...current, message]);
  }

  clearLogs() {
    this.logsSubject.next([]);
  }

}