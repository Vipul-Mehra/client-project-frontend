import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Models
import { TimeSheet } from '../../model/timeSheet';
import { Resource } from '../../model/resource';
import { Project } from '../../model/projects';
import { Client } from '../../model/client';
import { ClientProject } from '../../model/clientProject';

// Services
import { TimeSheetService } from '../../services/timeSheet.service';
import { ResourceService } from '../../services/resource.service';
import { ClientService } from '../../services/clientService';
import { ProjectService } from '../../services/projectService';
import { ClientProjectService } from '../../services/clientProject.service';

// Interfaces
import { PaginatedResponse } from '../../model/pagination-response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-time-sheet',
  templateUrl: './timeSheet.component.html',
  styleUrls: ['./timeSheet.component.css'],
  standalone: true,
  imports: [
    // Required modules
    FormsModule,
    CommonModule
  ]
})
export class TimeSheetComponent implements OnInit {
  // Filter fields
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';

  // Data lists
  workTimetables: TimeSheet[] = [];
  filteredWorkTimetables: TimeSheet[] = [];
  resources: Resource[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  // Form model for create
  newTimeSheet = {
    resourceId: null as number | null,
    clientId: null as number | null,
    clientProjectId: null as number | null,
    workDate: '',
    hoursWorked: null as number | null,
  };

  // For editing
  editingTimeSheet: TimeSheet | null = null;
  selectedClient: Client | null = null;
  selectedProject: Project | null = null;
  editingClientId: number | null = null;

  // Pagination info
  totalRecords: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(
    private timeSheetService: TimeSheetService,
    private resourceService: ResourceService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private clientProjectService: ClientProjectService
  ) {}

  ngOnInit(): void {
    this.loadResources();
    this.loadClients();
    this.loadProjects();
    this.loadWorkTables();
  }

  applyFilters(): void {
    let data = [...this.workTimetables];
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      data = data.filter((item) =>
        item.resourceId?.toString().includes(term) ||
        item.clientProject?.client?.clientName?.toLowerCase().includes(term) ||
        item.clientProject?.project?.projectName?.toLowerCase().includes(term)
      );
    }

    if (this.startDate || this.endDate) {
      const start = this.startDate ? new Date(this.startDate) : null;
      const end = this.endDate ? new Date(this.endDate) : null;
      data = data.filter((item) => {
        const itemDate = new Date(item.workDate);
        return (!start || itemDate >= start!) && (!end || itemDate <= end!);
      });
    }

    this.filteredWorkTimetables = data;
  }

  loadWorkTables(): void {
    this.timeSheetService.getTimeSheets(this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse<TimeSheet>) => {
        this.totalRecords = response.totalElements;
        this.currentPage = response.pageable.pageNumber;
        this.pageSize = response.pageable.pageSize;
        this.totalPages = response.totalPages;
        const data = response.content || [];

        this.workTimetables = [];
        this.workTimetables.forEach(timeSheet => {
          forkJoin({
            clientProject: timeSheet.clientProjectId
              ? this.clientProjectService.getClientProjectById(timeSheet.clientProjectId).pipe(catchError(() => of(undefined)))
              : of(undefined),
            resource: timeSheet.resourceId
              ? this.resourceService.getResourceById(timeSheet.resourceId).pipe(
                  catchError(error => {
                    console.error('Error fetching resource:', error);
                    return of(undefined);
                  })
                )
              : of(undefined),
          }).subscribe(({ clientProject, resource }) => {
            this.workTimetables.push({ ...timeSheet, clientProject, resource });
            this.applyFilters();
          });
        });
      },
      error: () => alert('Failed to load time sheets.')
    });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
  }

  loadResources(): void {
    this.resourceService.getResources().subscribe(res => this.resources = res);
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(res => this.clients = res);
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(res => this.projects = res);
  }

  loadClientProjects(clientId: number | null): void {
    if (!clientId) return;

    this.selectedClient = this.clients.find(c => c.id === clientId) || null;
    this.newTimeSheet.clientProjectId = null;
    this.selectedProject = null;
    this.filteredProjects = [];

    this.clientProjectService.getAllClientProjects().subscribe((clientProjects) => {
      this.filteredProjects = clientProjects
        .filter(cp => cp.client?.id === clientId)
        .map(cp => cp.project);
    });
  }

  onClientSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const clientId = Number(target.value);
    this.newTimeSheet.clientId = clientId;
    this.loadClientProjects(clientId);
  }

  onProjectChangeEdit(event: Event): void {
    const projectId = Number((event.target as HTMLSelectElement).value);
    this.selectedProject = this.filteredProjects.find(p => p.projectId === projectId) || null;

    if (this.editingClientId && this.selectedProject && this.editingTimeSheet) {
      this.clientProjectService.getAllClientProjects().subscribe(clientProjects => {
        const cp = clientProjects.find(cp =>
          cp.client?.id === this.editingClientId &&
          cp.project?.projectId === this.selectedProject?.projectId
        );
        this.editingTimeSheet!.clientProjectId = cp?.clientProjectId ?? null;
        if (!cp) alert('Client-Project mapping not found for edit.');
      });
    } else if (this.editingTimeSheet) {
      this.editingTimeSheet.clientProjectId = null;
      this.selectedProject = null;
    }
  }

  addTimeSheet(): void {
    const { resourceId, workDate, hoursWorked, clientProjectId } = this.newTimeSheet;
    if (!resourceId || !clientProjectId || !workDate || hoursWorked === null) {
      alert('All fields are required.');
      return;
    }

    this.timeSheetService.addTimeSheet({
      resourceId,
      clientProjectId,
      workDate,
      hoursWorked
    }).subscribe({
      next: () => {
        this.loadWorkTables();
        this.resetForm();
        this.closeModal('addTimeSheetModal');
      },
      error: () => alert('Failed to add time sheet.'),
    });
  }

  startEdit(timeSheet: TimeSheet): void {
    this.editingTimeSheet = { ...timeSheet };
    if (this.editingTimeSheet.clientProjectId) {
      this.clientProjectService.getClientProjectById(this.editingTimeSheet.clientProjectId).subscribe(cp => {
        this.editingClientId = cp?.client?.id || null;
        this.selectedClient = cp?.client || null;
        this.selectedProject = cp?.project || null;
        this.loadClientProjects(this.editingClientId);
      });
    }
  }

  cancelEdit(): void {
    this.editingTimeSheet = null;
    this.editingClientId = null;
    this.selectedClient = null;
    this.selectedProject = null;
  }

  updateTimeSheet(): void {
    if (!this.editingTimeSheet?.timeSheetId) return;
    const { resourceId, workDate, hoursWorked } = this.editingTimeSheet;
    const clientProjectId = this.editingTimeSheet.clientProjectId;

    if (!resourceId || !clientProjectId || !workDate || hoursWorked === null) {
      alert('All fields are required!');
      return;
    }

    this.timeSheetService.updateTimeSheet(this.editingTimeSheet.timeSheetId, {
      resourceId,
      clientProjectId,
      workDate,
      hoursWorked
    }).subscribe({
      next: () => {
        this.loadWorkTables();
        this.cancelEdit();
        this.closeModal('editTimeSheetModal');
      },
      error: () => alert('Failed to update time sheet'),
    });
  }

  deleteTimeSheet(id?: number): void {
    if (!id || !confirm('Are you sure you want to delete this entry?')) return;

    this.timeSheetService.deleteTimeSheet(id).subscribe(() => {
      this.loadWorkTables();
    });
  }

  resetForm(): void {
    this.newTimeSheet = {
      resourceId: null,
      clientId: null,
      clientProjectId: null,
      workDate: '',
      hoursWorked: null,
    };
    this.filteredProjects = [];
    this.selectedClient = null;
    this.selectedProject = null;
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.style.display = 'none';
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.style.overflow = '';
    }
  }

  onClientSelectEdit(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const clientId = Number(target.value);
    this.editingClientId = clientId;
    this.loadClientProjects(clientId);

    if (this.editingTimeSheet) {
      this.editingTimeSheet.clientProjectId = null;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadWorkTables();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadWorkTables();
  }
}
