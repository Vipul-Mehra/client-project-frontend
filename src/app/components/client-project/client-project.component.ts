import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientProjectService } from '../../services/clientproject.service';
import { Client } from '../../model/client';
import { Project } from '../../model/projects';


import { Observable } from 'rxjs';
import { ProjectService } from '../../services/projectService';
import { ClientProject } from '../../model/clientProject';
import { ClientService } from '../../services/clientservice';

@Component({
  selector: 'app-client-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-project-list.component.html',
  styleUrls: ['./client-project-list.component.css']
})
export class ClientProjectListComponent implements OnInit {
  clientProjects: ClientProject[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  newClientProject: { client: Client | null; projectId: Project | null } = { client: null, projectId: null };
  editingClientProject: ClientProject | null = null;

  constructor(
    private clientProjectService: ClientProjectService,
    private clientService: ClientService,
    private projectService: ProjectService // Injected as ProjectService
  ) {}

  ngOnInit(): void {
    this.loadClientProjects();
    this.loadClients();
    this.loadProjects();
  }

  loadClientProjects(): void {
    this.clientProjectService.getAllClientProjects().subscribe({
      next: (data: ClientProject[]) => {
        this.clientProjects = data;
      },
      error: (error: any) => {
        console.error('Error loading client projects:', error);
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data: Client[]) => {
        this.clients = data;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({ // Corrected method call
      next: (data: Project[]) => {
        this.projects = data;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  addClientProject(): void {
    if (this.newClientProject.client && this.newClientProject.projectId) {
      const clientProject: ClientProject = {
        clientProjectId: 0,
        client: this.newClientProject.client,
        project: this.newClientProject.projectId
      };
      this.clientProjectService.createClientProject(clientProject).subscribe({
        next: () => {
          this.newClientProject = { client: null, projectId: null };
          this.loadClientProjects();
        },
        error: (err: any) => console.error('Error adding client project:', err)
      });
    } else {
      alert('Please select both a client and a project.');
    }
  }

  deleteClientProject(id: number): void {
    if (confirm('Are you sure you want to delete this client project?')) {
      this.clientProjectService.deleteClientProject(id).subscribe({
        next: () => {
          this.loadClientProjects();
        },
        error: (error: any) => { console.error("Error deleting", error); }
      });
    }
  }
}
