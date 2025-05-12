// src/app/services/timeSheet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSheet } from '../model/timeSheet';

@Injectable({
  providedIn: 'root',
})
export class TimeSheetService {
  private apiUrl = 'http://localhost:8080/timeSheets';

  constructor(private http: HttpClient) {}

  getTimeSheets(): Observable<TimeSheet[]> {
    return this.http.get<TimeSheet[]>(this.apiUrl);
  }

  addTimeSheet(timeSheet: TimeSheet): Observable<TimeSheet> {
    return this.http.post<TimeSheet>(this.apiUrl, timeSheet);
  }

  updateTimeSheet(id: number, timeSheet: TimeSheet): Observable<TimeSheet> {
    return this.http.put<TimeSheet>(`${this.apiUrl}/${id}`, timeSheet);
  }

  deleteTimeSheet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
