import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../model/paginationResponse';
import { TimeSheet } from '../model/timeSheet';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {
  private apiUrl = '/api/timeSheets';

  constructor(private http: HttpClient) {}

  getTimeSheets(page: number = 0, size: number = 10): Observable<PaginatedResponse<TimeSheet>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PaginatedResponse<TimeSheet>>(this.apiUrl, { params });
  }

  addTimeSheet(timeSheet: Omit<TimeSheet, 'timeSheetId'>): Observable<TimeSheet> {
    return this.http.post<TimeSheet>(this.apiUrl, timeSheet);
  }

  updateTimeSheet(id: number, timeSheet: Partial<TimeSheet>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, timeSheet);
  }

  deleteTimeSheet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
