import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientProject } from '../model/clientProject';

@Injectable({
  providedIn: 'root'
})
export class ClientProjectService {
  private apiUrl = 'http://localhost:8080/client-projects';

  constructor(private http: HttpClient) {}

  getClientProjects(): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.apiUrl);
  }

  getClientProjectById(id: number): Observable<ClientProject> {
    return this.http.get<ClientProject>(`${this.apiUrl}/${id}`);
  }

  addClientProject(project: ClientProject): Observable<ClientProject> {
    return this.http.post<ClientProject>(this.apiUrl, project);
  }
}
