import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';
import { WorkTableComponent } from './components/WorkTable/WorkTable.component';

export const routes: Routes = [
  { path: 'workTable', component: WorkTableComponent },
  { path: 'clients', component: ClientListComponent },
  { path: 'resources', component: ResourceListComponent },
  { path: '', redirectTo: 'workTable', pathMatch: 'full' }
];
