import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../model/projects'; // Corrected import

@Injectable({
  providedIn: 'root'
})
export class ProjectService { // Renamed class
  private apiUrl = 'http://localhost:8080/projecttable'; // Adjust the URL if needed

  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<Project[]> { // Renamed method
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: number): Observable<Project> { // Added for completeness
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> { // Added for completeness
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> { // Added for completeness
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {  // Added for completeness
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
