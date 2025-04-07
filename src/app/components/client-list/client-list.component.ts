// src/app/clients/client-list/client-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../client.service';
import { Client } from '../../client.model';

@Component({
  selector: 'app-client-list',
  standalone: true, // ✅ IMPORTANT
  imports: [CommonModule], // ✅ Needed for *ngIf, *ngFor
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  deleteClient(id: number) {
    this.clientService.deleteClient(id).subscribe(() => {
      this.clients = this.clients.filter(client => client.clientId !== id);
    });
  }
}
