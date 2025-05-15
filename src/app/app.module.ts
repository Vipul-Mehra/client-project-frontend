import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

// Route Configuration
const routes: Routes = [
  {
    path: 'timeSheets',
    loadComponent: () =>
      import('./components/timeSheet/timeSheet.component').then(
        (m) => m.TimeSheetComponent
      ),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./components/client-list/client-list.component').then(
        (m) => m.ClientListComponent
      ),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./components/resource-list/resource-list.component').then(
        (m) => m.ResourceListComponent
      ),
  },
  { path: '', redirectTo: '/timeSheets', pathMatch: 'full' },
  { path: '**', redirectTo: '/timeSheets' }, // wildcard fallback
];

@NgModule({
  declarations: [
    AppComponent,
    // No need to declare standalone components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes, {
      useHash: false, // OR true, see explanation below
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
