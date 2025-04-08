import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';

export const routes: Routes = [
  { path: 'clients', component: ClientListComponent },
  { path: 'resources', component: ResourceListComponent },
  { path: '', redirectTo: 'clients', pathMatch: 'full' }
];
