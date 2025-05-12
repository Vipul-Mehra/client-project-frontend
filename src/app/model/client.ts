import { ClientProject } from './clientProject';

export interface Client {
  id: number; // NOT clientId
  clientName: string;
  clientEmail: string;
  clientProjects?: ClientProject[];
}
