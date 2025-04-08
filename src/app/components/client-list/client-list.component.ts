import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-xl font-bold mb-2">Clients</h2>
      <input [(ngModel)]="searchTerm" placeholder="Search clients..." class="p-2 border mb-4 w-full" />
      <form (submit)="addClient()" class="flex gap-2 mb-4">
        <input [(ngModel)]="newClient.name" name="name" placeholder="Client Name" class="p-2 border" required />
        <input [(ngModel)]="newClient.email" name="email" placeholder="Email" class="p-2 border" required />
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </form>
      <table class="w-full border">
        <thead>
          <tr>
            <th class="border p-2">Name</th>
            <th class="border p-2">Email</th>
            <th class="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let client of filteredClients()">
            <td class="border p-2">{{ client.clientName || 'N/A' }}</td>
            <td class="border p-2">{{ client.clientEmail || 'N/A' }}</td>
            <td class="border p-2">
              <button (click)="editClient(client)" class="text-yellow-600">Edit</button>
              <button (click)="deleteClient(client.clientId)" class="text-red-600 ml-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  clients: any[] = [];
  newClient = { name: '', email: '' };
  searchTerm = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => {
      console.log('Clients Data:', data);  // Debugging line
      this.clients = data;
    });
  }

  addClient() {
    this.clientService.addClient(this.newClient).subscribe(() => {
      this.newClient = { name: '', email: '' };
      this.loadClients();
    });
  }

  editClient(client: any) {
    const updatedName = prompt('Enter new name', client.clientName);
    const updatedEmail = prompt('Enter new email', client.clientEmail);
    if (updatedName && updatedEmail) {
      const updated = { ...client, clientName: updatedName, clientEmail: updatedEmail };
      this.clientService.updateClient(updated.clientId, updated).subscribe(() => this.loadClients());
    }
  }

  deleteClient(id: number) {
    if (!id) {
      console.error("Invalid client ID:", id);
      return;
    }

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.loadClients(); // Refresh the client list after deletion
      },
      error: (err) => {
        console.error('Error deleting client:', err);
      }
    });
  }

  filteredClients() {
    return this.clients.filter(c => (c.clientName || '').toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
}
