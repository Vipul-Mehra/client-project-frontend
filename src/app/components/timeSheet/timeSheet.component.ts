import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeSheetService } from '././services/TimeSheetService';
import { TimeSheet } from '././model/TimeSheet';


@Component({
  selector: 'app-timetable',
  templateUrl: './timeSheet.component.html',
  styleUrls: ['./timeSheet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimeSheetComponent  implements OnInit {
  searchTerm = '';
  workTimetables: TimeSheet[] = [];

  constructor(private timeSheetService: TimeSheetService) {}

  ngOnInit(): void {
    this.loadWorkTables();
  }

  loadWorkTables(): void {
    this.timeSheetService.getTimeSheets().subscribe({
      next: (data: TimeSheet[]) => {
        this.workTimetables = data;
        console.log('Fetched Work Tables:', this.workTimetables);
      },
      error: (err: any) => {
        console.error('Error loading work tables:', err);
      }
    });
  }

  get filteredWorkTimetables(): TimeSheet[] {
    const term = this.searchTerm.toLowerCase();
    return this.workTimetables.filter((item) =>
      item.resourceId.toString().toLowerCase().includes(term) ||
      item.clientProjectId.toString().toLowerCase().includes(term)
    );
  }

  editClient(client: TimeSheet): void {
    console.log('Editing client:', client);
  }

  deleteClient(workId: number): void {
    console.log('Deleting client with ID:', workId);
  }
}
