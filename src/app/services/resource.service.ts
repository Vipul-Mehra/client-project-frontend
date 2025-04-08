import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private baseUrl = 'http://localhost:8080/api/resources';

  constructor(private http: HttpClient) {}

  getResources(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  addResource(resource: any): Observable<any> {
    return this.http.post(this.baseUrl, resource);
  }

  updateResource(id: number, resource: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, resource);
  }

  deleteResource(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
