import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkTableService {
  private baseUrl = 'http://localhost:8080/worktimetables';

  constructor(private http: HttpClient) {}

  getWorkTable(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  addWorkTable(workTable: any): Observable<any> {
    return this.http.post(this.baseUrl, workTable);
  }

  updateWorkTable(id: number, workTable: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, workTable);
  }

  deleteWorkTable(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
