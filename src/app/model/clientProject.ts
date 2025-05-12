import { Client } from './client';
import { Project } from './projects';

export interface ClientProject {
  clientProjectId: number;
  client: Client;
  project: Project;
  clientId?: number;
    projectId?: number;
}

