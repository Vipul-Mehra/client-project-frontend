import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Models
import { TimeSheet } from '../../model/timeSheet';
import { Resource } from '../../model/resource';
import { Project } from '../../model/projects';
import { Client } from '../../model/client';
import { ClientProject } from '../../model/clientProject';

// Services
import { TimeSheetService } from '../../services/timeSheet.service';
import { ResourceService } from '../../services/resource.service';
import { ClientService } from '../../services/clientservice';
import { ClientProjectService } from '../../services/clientproject.service';
import { ProjectService } from '../../services/projectService';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './timeSheet.component.html',
  styleUrls: ['./timeSheet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TimeSheetComponent implements OnInit {
  // Filters
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';

  // Data
  workTimetables: TimeSheet[] = [];
  filteredWorkTimetables: TimeSheet[] = [];
  resources: Resource[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  newTimeSheet = {
    resourceId: null as number | null,
    clientId: null as number | null,
    clientProjectId: null as number | null,
    workDate: '',
    hoursWorked: null as number | null,
  };

  editingTimeSheet: TimeSheet | null = null;
  selectedClient: Client | null = null;
  selectedProject: Project | null = null;

  editResourceId: number | null = null;
  editClientId: number | null = null;
  editProjectId: number | null = null;
  editWorkDate: string = '';
  editHoursWorked: number | null = null;

  constructor(
    private timeSheetService: TimeSheetService,
    private resourceService: ResourceService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private clientProjectService: ClientProjectService
  ) {}

  ngOnInit(): void {
    this.loadWorkTables();
    this.loadResources();
    this.loadClients();
    this.loadProjects();
  }

  applyFilters(): void {
    let filteredData = [...this.workTimetables];
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      filteredData = filteredData.filter((item) =>
        item.resourceId?.toString().toLowerCase().includes(term) ||
        item.clientProject?.project?.projectName?.toLowerCase().includes(term) ||
        item.clientProject?.client?.clientName?.toLowerCase().includes(term)
      );
    }

    if (this.startDate || this.endDate) {
      const start = this.startDate ? new Date(this.startDate) : null;
      const end = this.endDate ? new Date(this.endDate) : null;
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.workDate);
        return (
          (!start || itemDate >= start!) &&
          (!end || itemDate <= end!)
        );
      });
    }

    this.filteredWorkTimetables = filteredData;
  }

  loadWorkTables(): void {
    this.timeSheetService.getTimeSheets().subscribe({
      next: (data: TimeSheet[]) => {
        this.workTimetables = data;
        this.applyFilters();
      },
      error: () => alert('Failed to load time sheets.'),
    });
  }

  loadResources(): void {
    this.resourceService.getResources().subscribe((resources: Resource[]) => {
      this.resources = resources;
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe((clients: Client[]) => {
      this.clients = clients.map(client => ({ ...client, Id: client.Id }));
      console.log('Clients Array:', this.clients);
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe((projects: Project[]) => {
      this.projects = projects;
      console.log('Projects Array:', this.projects);
    });
  }

  loadClientProjects(clientId: number | null): void {
    this.filteredProjects = [];
    if (!clientId) return;

    this.selectedClient = this.clients.find(c => c.Id === clientId) || null;

    this.clientProjectService.getAllClientProjects().subscribe((clientProjects: ClientProject[]) => {
      this.filteredProjects = clientProjects
        .filter(cp => cp.client?.Id === clientId)
        .map(cp => cp.project);

      console.log('Filtered Projects:', this.filteredProjects);
    });

    this.newTimeSheet.clientProjectId = null;
    this.selectedProject = null;
  }

  onClientSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    const selectedClientId = selectedValue ? parseInt(selectedValue, 10) : null;

    console.log('Selected Client ID:', selectedClientId);

    this.newTimeSheet.clientId = selectedClientId;
    this.loadClientProjects(selectedClientId);
  }

  onProjectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const projectId = Number(target.value);
    this.selectedProject = this.filteredProjects.find(p => p.projectId === projectId) || null;
  }

  addTimeSheet(): void {
    const { resourceId, workDate, hoursWorked } = this.newTimeSheet;
    const clientProjectId = this.newTimeSheet.clientProjectId;

    if (!resourceId || !clientProjectId || !workDate || hoursWorked === null || !this.selectedClient || !this.selectedProject) {
      alert('All fields are required!');
      return;
    }

    const payload: TimeSheet = {
      resourceId,
      clientProject: {
        clientProjectId: clientProjectId,
        client: this.selectedClient,
        project: this.selectedProject,
      },
      workDate,
      hoursWorked,
    };

    this.timeSheetService.addTimeSheet(payload).subscribe({
      next: (saved: TimeSheet) => {
        this.workTimetables.push(saved);
        this.applyFilters();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error adding time sheet', err);
        alert('Failed to add time sheet.');
      },
    });
  }

  startEdit(timetable: TimeSheet): void {
    this.editingTimeSheet = { ...timetable };
    this.editResourceId = timetable.resourceId;
    this.editWorkDate = timetable.workDate;
    this.editHoursWorked = timetable.hoursWorked;

    if (this.editingTimeSheet.clientProject?.client?.Id) {
      this.loadClientProjects(this.editingTimeSheet.clientProject.client.Id);
      this.selectedProject = this.filteredProjects.find(p => p.projectId === this.editingTimeSheet?.clientProject?.project?.projectId) || null;
    }
  }

  cancelEdit(): void {
    this.editingTimeSheet = null;
    this.editResourceId = null;
    this.editClientId = null;
    this.editProjectId = null;
    this.editWorkDate = '';
    this.editHoursWorked = null;
    this.selectedClient = null;
    this.selectedProject = null;
  }

  updateTimeSheet(): void {
    if (!this.editingTimeSheet?.timeSheetId) return;

    const { resourceId, workDate, hoursWorked } = this.editingTimeSheet;
    const clientProjectId = this.editingTimeSheet.clientProject?.clientProjectId;

    if (!resourceId || !clientProjectId || !workDate || hoursWorked === null || !this.selectedClient || !this.selectedProject) {
      alert('All fields are required!');
      return;
    }

    const payload: TimeSheet = {
      timeSheetId: this.editingTimeSheet.timeSheetId,
      resourceId,
      clientProject: {
        clientProjectId: clientProjectId,
        client: this.selectedClient,
        project: this.selectedProject,
      },
      workDate,
      hoursWorked,
    };

    this.timeSheetService.updateTimeSheet(this.editingTimeSheet.timeSheetId, payload).subscribe({
      next: () => {
        this.loadWorkTables();
        this.cancelEdit();
      },
      error: (err) => {
        alert('Failed to update time sheet');
        console.error('Update error:', err);
      },
    });
  }

  deleteTimeSheet(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      this.timeSheetService.deleteTimeSheet(id).subscribe(() => {
        this.loadWorkTables();
      });
    }
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
}
