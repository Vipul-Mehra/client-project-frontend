import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSheet } from '../models/time-sheet.model'; // adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {
  private apiUrl = 'http://localhost:8080/api/time-sheets';

  constructor(private http: HttpClient) {}

  getTimeSheets(): Observable<TimeSheet[]> {
    return this.http.get<TimeSheet[]>(this.apiUrl);
  }

  // Optional: Add other CRUD operations
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
