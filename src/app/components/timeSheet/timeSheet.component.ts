import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-time-sheet',
  templateUrl: './timeSheet.component.html',
  styleUrls: ['./timeSheet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
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
        return (!start || itemDate >= start) && (!end || itemDate <= end);
      });
    }

    this.filteredWorkTimetables = data;
  }

  loadWorkTables(): void {
     this.timeSheetService.getTimeSheets().subscribe({
       next: (data: TimeSheet[]) => {
         this.workTimetables = [];
         data.forEach(timeSheet => {
           forkJoin({
             clientProject: timeSheet.clientProjectId
               ? this.clientProjectService.getClientProjectById(timeSheet.clientProjectId).pipe(catchError(() => of(undefined)))
               : of(undefined),
             resource: timeSheet.resourceId
               ? this.resourceService.getResourceById(timeSheet.resourceId).pipe(
                   catchError(error => {
                     console.error('Error fetching resource:', error);
                     return of(undefined); // Changed null to undefined here
                   })
                 )
               : of(undefined), // And here
           }).subscribe(({ clientProject, resource }) => {
             this.workTimetables.push({ ...timeSheet, clientProject, resource });
             this.applyFilters();
           });
         });
       },
       error: () => alert('Failed to load time sheets.')
     });
   }


  loadResources(): void {
    this.resourceService.getResources().subscribe((res) => this.resources = res);
  }

  loadClients(): void {
    this.clientService.getClients().subscribe((res) => this.clients = res);
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe((res) => this.projects = res);
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

    const payload: Omit<TimeSheet, 'timeSheetId'> = {
      resourceId,
      clientProjectId,
      workDate,
      hoursWorked,
    };

    this.timeSheetService.addTimeSheet(payload).subscribe({
      next: (saved) => {
        this.loadWorkTables();
        this.resetForm();
        this.closeModal('addTimeSheetModal'); // Close add modal
      },
      error: () => alert('Failed to add time sheet.'),
    });
  }

  startEdit(timeSheet: TimeSheet): void {
    this.editingTimeSheet = { ...timeSheet };
    if (this.editingTimeSheet.clientProjectId) {
      this.clientProjectService.getClientProjectById(this.editingTimeSheet.clientProjectId).subscribe(cp => {
        this.editingClientId = cp.client?.id || null;
        this.selectedClient = cp.client;
        this.selectedProject = cp.project;
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
      hoursWorked,
    }).subscribe({
      next: () => {
        this.loadWorkTables();
        this.cancelEdit();
        this.closeModal('editTimeSheetModal'); // Close edit modal
      },
      error: (err) => {
        alert('Failed to update time sheet');
      },
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
      modalElement.setAttribute('style', 'display: none;');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
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
}
