// src/app/model/timeSheet.ts

import { Resource } from './resource';
import { ClientProject } from './clientProject';

export interface TimeSheet {
  timeSheetId?: number;
  resourceId: number | null;
  clientProjectId: number | null;
  workDate: string;
  hoursWorked: number | null;
  resource?: Resource;
  clientProject?: ClientProject;
}
