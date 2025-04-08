import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="p-4 bg-gray-100 min-h-screen">
      <h1 class="text-2xl font-bold mb-4">Client-Resource Time Tracking System</h1>
      <div class="flex gap-4 mb-6">
        <button routerLink="/clients" class="bg-blue-600 text-white px-4 py-2 rounded">Clients</button>
        <button routerLink="/resources" class="bg-green-600 text-white px-4 py-2 rounded">Resources</button>
      </div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'client-frontend';
  
}
