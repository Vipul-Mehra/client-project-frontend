import { Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';
import { TimeSheetComponent } from './components/timeSheet/timeSheet.component';

export const routes: Routes = [
  { path: 'clients', component: ClientListComponent },
   { path: 'resources', component: ResourceListComponent },
   { path: 'timesheets', component: TimeSheetComponent },
  { path: '', redirectTo: 'workTable', pathMatch: 'full' }
];
