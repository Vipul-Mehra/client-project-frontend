import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // For HTTP requests
import { FormsModule } from '@angular/forms'; // For [(ngModel)] two-way binding
import { RouterModule } from '@angular/router'; // For routing

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    // Add other non-standalone components here if needed
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/client-list/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      { path: '', redirectTo: '/clients', pathMatch: 'full' }, // Default route
      { path: '**', redirectTo: '/clients' }, // Wildcard route
    ]),
  ],
  providers: [], // Add services here if not using providedIn: 'root'
  bootstrap: [AppComponent], // Root component
})
export class AppModule {}