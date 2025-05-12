// src/app/components/timeSheet/timeSheet.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import bootstrap1 from '../../../main.server';
import * as bootstrap from 'bootstrap';
import { Modal } from 'bootstrap';
// Models
import { TimeSheet } from '../../model/timeSheet';
import { Resource } from '../../model/resource';
import { Project } from '../../model/projects';
import { Client } from '../../model/client';
import { ClientProject } from '../../model/clientProject';

// Services
import { TimeSheetService } from '../../services/timeSheet.service';
import { ResourceService } from '../../services/resource.service';
// import { ClientService } from '../../services/clientService';
import { ClientProjectService } from '../../services/clientProject.service';
import { ProjectService } from '../../services/projectService';
import { ClientService } from '../../services/clientService';

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
       this.workTimetables = []; // Clear existing data
       data.forEach(timeSheet => {
         if (timeSheet.clientProjectId) {
           this.clientProjectService.getClientProjectById(timeSheet.clientProjectId).subscribe(clientProject => {
             this.workTimetables.push({ ...timeSheet, clientProject });
             this.applyFilters(); // Apply filters after all data is loaded (or update as you go)
           });
         } else {
           this.workTimetables.push(timeSheet);
           this.applyFilters();
         }
       });
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
      this.clients = clients.map(c => ({ ...c, id: c.id }));
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe((projects: Project[]) => {
      this.projects = projects;
    });
  }

  loadClientProjects(clientId: number | null): void {
    this.filteredProjects = [];
    if (!clientId) return;

    this.selectedClient = this.clients.find(c => c.id === clientId) || null;

    this.clientProjectService.getAllClientProjects().subscribe((clientProjects: ClientProject[]) => {
      this.filteredProjects = clientProjects
        .filter(cp => cp.client?.id === clientId)
        .map(cp => cp.project);
    });

    this.newTimeSheet.clientProjectId = null;
    this.selectedProject = null;
  }

  onClientSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    const selectedClientId = selectedValue ? parseInt(selectedValue, 10) : null;

    this.newTimeSheet.clientId = selectedClientId;
    this.loadClientProjects(selectedClientId);
  }

  onProjectChange(event: Event): void {
    console.log('onProjectChange triggered');
    const target = event.target as HTMLSelectElement;
    const projectId = Number(target.value);

    this.selectedProject = this.filteredProjects.find(p => p.projectId === projectId) || null;

    if (this.selectedClient && this.selectedProject) {
      this.clientProjectService.getAllClientProjects().subscribe(clientProjects => {
        console.log('Fetched clientProjects:', clientProjects);
        const foundClientProject = clientProjects.find(
          cp => cp.client?.id === this.selectedClient?.id && cp.project?.projectId === this.selectedProject?.projectId
        );
        if (foundClientProject) {
          this.newTimeSheet.clientProjectId = foundClientProject.clientProjectId;
          console.log('clientProjectId set to:', this.newTimeSheet.clientProjectId);
        } else {
          this.newTimeSheet.clientProjectId = null;
          alert('Error: Could not find the Client Project for the selected Client and Project.');
        }
      });
    } else {
      this.newTimeSheet.clientProjectId = null;
    }
  }

addTimeSheet(): void {
  console.log('newTimeSheet before add:', this.newTimeSheet);
  const { resourceId, workDate, hoursWorked, clientProjectId } = this.newTimeSheet;

  if (!resourceId || !clientProjectId || !workDate || hoursWorked === null) {
    alert('All fields are required!');
    return;
  }

  const payload: Omit<TimeSheet, 'timeSheetId'> = {
    resourceId,
    clientProjectId: clientProjectId, // Now this should be a valid property of TimeSheet
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

 startEdit(timeSheet: TimeSheet): void {
   this.editingTimeSheet = { ...timeSheet };
   if (this.editingTimeSheet.clientProjectId) {
     this.clientProjectService.getClientProjectById(this.editingTimeSheet.clientProjectId).subscribe(cp => {
       this.selectedClient = cp.client || null;
       this.selectedProject = cp.project || null;
       this.loadClientProjects(this.selectedClient?.id || null);
     });
   }

   const modalElement = document.getElementById('editTimeSheetModal');
   if (modalElement) {
     const editModal = new bootstrap.Modal(modalElement);
     editModal.show();
   } else {
     console.error('Modal element not found');
   }
 }

 cancelEdit(): void {
   this.editingTimeSheet = null;
   this.selectedClient = null;
   this.selectedProject = null;

   const modalElement = document.getElementById('editTimeSheetModal');
   if (modalElement) {
     const editModal = bootstrap.Modal.getInstance(modalElement);
     if (editModal) {
       editModal.hide();
     }
   } else {
     console.error('Modal element not found');
   }
 }
updateTimeSheet(): void { // Removed the timeSheetId argument here
  if (!this.editingTimeSheet?.timeSheetId) return;

  const { resourceId, workDate, hoursWorked } = this.editingTimeSheet;
  const clientProjectId = this.editingTimeSheet.clientProjectId; // Use the direct clientProjectId

  if (!resourceId || !clientProjectId || !workDate || hoursWorked === null || !this.selectedClient || !this.selectedProject) {
    alert('All fields are required!');
    return;
  }

  const payload: TimeSheet = {
    timeSheetId: this.editingTimeSheet.timeSheetId,
    resourceId,
    clientProjectId: clientProjectId, // Send clientProjectId directly
    workDate,
    hoursWorked,
    // Do not include client and project objects directly if your backend expects clientProjectId
    // clientProject: {
    //   clientProjectId: clientProjectId,
    //   client: this.selectedClient,
    //   project: this.selectedProject,
    // },
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
