import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeSheetService } from '../../services/timeSheet.service';
import { ResourceService } from '../../services/resource.service';
import { ClientProjectService } from '../../services/client-project.service';
import { TimeSheet } from '../../model/timeSheet';



@Component({
  selector: 'app-time-sheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimeSheetComponent implements OnInit {

  // Date Filters
  startDate: string = ''; // format: YYYY-MM-DD
  endDate: string = '';

  // Search Filter
  searchTerm: string = '';

  // Data
  workTimetables: TimeSheet[] = [];
  filteredWorkTimetables: TimeSheet[] = [];
  newTimeSheet = {
    resourceId: null as number | null,
    clientProjectId: null as number | null,
    workDate: '',
    hoursWorked: null as number | null
  };

  editingTimeSheet: TimeSheet | null = null;
  resources: { id: number; name: string }[] = [];
  clientProjects: { id: number; label: string }[] = [];

  constructor(
    private timeSheetService: TimeSheetService,
    private resourceService: ResourceService,
    private clientProjectService: ClientProjectService
  ) {}

  ngOnInit(): void {
    this.loadWorkTables();
    this.loadResources();
    this.loadClientProjects();
  }

  /**
   * Apply all filters: text search + date range
   */
  applyFilters(): void {
    let filteredData = [...this.workTimetables];

    const term = this.searchTerm.trim().toLowerCase();

    // Text search filtering
    if (term) {
      filteredData = filteredData.filter(item =>
        (item.resourceName?.toLowerCase().includes(term)) ||
        (item.projectName?.toLowerCase().includes(term)) ||
        (item.clientName?.toLowerCase().includes(term))
      );
    }

    // Date range filtering
    if (this.startDate || this.endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.workDate);
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;

        return (
          (!start || itemDate >= start) &&
          (!end || itemDate <= end)
        );
      });
    }

    this.filteredWorkTimetables = filteredData;
  }

  loadWorkTables(): void {
    this.timeSheetService.getTimeSheets().subscribe({
      next: (data: TimeSheet[]) => {
        this.workTimetables = data;
        this.applyFilters(); // Apply filters after data loads
      },
      error: () => {
        alert('Failed to load time sheets.');
      }
    });
  }

  loadResources(): void {
    this.resourceService.getResources().subscribe(resources => {
      this.resources = resources.map(r => ({
        id: r.resourceId,
        name: r.resourceName
      }));
    });
  }

  loadClientProjects(): void {
    this.clientProjectService.getClientProjects().subscribe(projects => {
      this.clientProjects = projects.map(cp => ({
        id: cp.clientProjectId,
        label: `${cp.clientName} - ${cp.projectName}`
      }));
    });
  }

  addTimeSheet(): void {
    const { resourceId, clientProjectId, workDate, hoursWorked } = this.newTimeSheet;

    if (!resourceId || !clientProjectId || !workDate || hoursWorked === null) {
      alert('All fields are required!');
      return;
    }

    const payload: TimeSheet = {
      resourceId,
      clientProjectId,
      workDate,
      hoursWorked
    };

    this.timeSheetService.addTimeSheet(payload).subscribe({
      next: (saved: TimeSheet) => {
        this.workTimetables.push(saved);
        this.applyFilters(); // Re-apply filter including new entry
        this.resetForm();
      },
      error: err => {
        console.error('Error adding time sheet', err);
        alert('Failed to add time sheet.');
      }
    });
  }

  startEdit(timetable: TimeSheet): void {
    this.editingTimeSheet = { ...timetable };
  }

  cancelEdit(): void {
    this.editingTimeSheet = null;
  }

  updateTimeSheet(): void {
    if (!this.editingTimeSheet?.timeSheetId) return;

    this.timeSheetService.updateTimeSheet(this.editingTimeSheet.timeSheetId, this.editingTimeSheet).subscribe({
      next: () => {
        this.loadWorkTables();
        this.cancelEdit();
      },
      error: err => {
        alert('Failed to update time sheet');
        console.error('Update error:', err);
      }
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
      clientProjectId: null,
      workDate: '',
      hoursWorked: null
    };
  }
}
