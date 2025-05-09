import { Client } from './client';
import { Project } from './projects';

export interface TimeSheet {
  timeSheetId?: number;
  resourceId: number | null;
  clientProject?: {
    clientProjectId: number;
    client: Client;
    project: Project;
  } | null;
  workDate: string;
  hoursWorked: number | null;
}
