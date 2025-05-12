// 1. src/app/services/client-project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientProject } from '../model/clientProject';

@Injectable({
  providedIn: 'root'
})
export class ClientProjectService {
  private apiUrl = 'http://localhost:8080/clientprojects';

  constructor(private http: HttpClient) { }

  getAllClientProjects(): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.apiUrl);
  }

  getClientProjectById(id: number): Observable<ClientProject> {
    return this.http.get<ClientProject>(`${this.apiUrl}/${id}`);
  }

  // Add this method
  getClientProjectByClientAndProject(clientId: number, projectId: number): Observable<ClientProject> {
    const params = new HttpParams()
      .set('clientId', clientId)
      .set('projectId', projectId);
    return this.http.get<ClientProject>(`${this.apiUrl}/byClientAndProject`, { params });
  }

  createClientProject(clientProject: ClientProject): Observable<ClientProject> {
    return this.http.post<ClientProject>(this.apiUrl, clientProject);
  }

  updateClientProject(id: number, clientProject: ClientProject): Observable<ClientProject> {
    return this.http.put<ClientProject>(`${this.apiUrl}/${id}`, clientProject);
  }

  deleteClientProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
