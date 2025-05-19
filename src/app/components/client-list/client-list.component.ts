import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/clientService';



interface Client {
  clientId: number;
  clientName: string;
  clientEmail: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-list.component.html', 
 styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  newClient: Partial<Client> = { clientName: '', clientEmail: '' };
  searchTerm = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data.map(client => ({
          clientId: client.id ?? client.clientId,
          clientName: client.name ?? client.clientName,
          clientEmail: client.email ?? client.clientEmail
        }));
        console.log('Mapped Clients:', this.clients);
      },
      error: err => console.error('Error loading clients:', err)
    });
  }

  addClient() {
    if (!this.newClient.clientName || !this.newClient.clientEmail) return;

    this.clientService.addClient(this.newClient).subscribe({
      next: () => {
        this.newClient = { clientName: '', clientEmail: '' };
        this.loadClients();
      },
      error: err => console.error('Error adding client:', err)
    });
  }

  editClient(client: Client) {
    const updatedName = prompt('Enter new name', client.clientName);
    const updatedEmail = prompt('Enter new email', client.clientEmail);

    if (updatedName && updatedEmail) {
      const updated = { ...client, clientName: updatedName, clientEmail: updatedEmail };
      this.clientService.updateClient(client.clientId, updated).subscribe({
        next: () => this.loadClients(),
        error: err => console.error('Error updating client:', err)
      });
    }
  }

  deleteClient(id: number) {
    if (!id) {
      console.error("Invalid client ID:", id);
      return;
    }

    this.clientService.deleteClient(id).subscribe({
      next: () => this.loadClients(),
      error: err => console.error('Error deleting client:', err)
    });
  }

  filteredClients() {
    const term = this.searchTerm.toLowerCase();
    return this.clients.filter(c =>
      (c.clientName || '').toLowerCase().includes(term) ||
      (c.clientEmail || '').toLowerCase().includes(term)
    );
  }
}
