// src/app/services/resource.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resource } from '../model/resource';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = 'http://localhost:8080/resources'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.apiUrl);
  }

  getResourceById(id: number): Observable<Resource> {
    return this.http.get<Resource>(`${this.apiUrl}/${id}`);
  }

  addResource(resource: Resource): Observable<Resource> {
    return this.http.post<Resource>(this.apiUrl, resource);
  }

  updateResource(id: number, resource: Resource): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, resource);
  }

  deleteResource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
