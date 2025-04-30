// src/app/model/time-sheet.model.ts
export interface TimeSheet {
  timeSheetId?: number;
  resourceId: number | null;
  resourceName?: string;
  resourceRole?: string;
  clientProjectId: number | null;
  projectName?: string;
  clientName?: string;
  workDate: string;
  hoursWorked: number | null;
}
