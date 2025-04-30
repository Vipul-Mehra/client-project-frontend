// src/app/components/resource-list/resource-list.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../services/resource.service';
import { Resource } from '../../model/resource';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.css']
})
export class ResourceListComponent {
  resources: Resource[] = [];
  newResource: Resource = { resourceId: 0, resourceName: '', resourceRole: '' };
  searchTerm = '';
  editingResource: Resource | null = null;

  constructor(private resourceService: ResourceService) {}

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.resourceService.getResources().subscribe(
      (data: any[]) => {
        this.resources = data.map((item: any) => ({
          resourceId: item.resourceId,
          resourceName: item.resourceName || 'UNNAMED',
          resourceRole: item.resourceRole || 'NO ROLE'
        }));
      },
      (error) => {
        console.error('Error fetching resources:', error);
      }
    );
  }

  addResource() {
    const payload = {
      resourceId: this.newResource.resourceId,
      resourceName: this.newResource.resourceName,
      resourceRole: this.newResource.resourceRole
    };

    this.resourceService.addResource(payload).subscribe({
      next: () => {
        this.newResource = { resourceId: 0, resourceName: '', resourceRole: '' };
        this.loadResources();
      },
      error: (err: any) => console.error('Error adding resource:', err)
    });
  }

  editResource(resource: Resource) {
    const updatedName = prompt('Enter new name', resource.resourceName);
    const updatedRole = prompt('Enter new role', resource.resourceRole);

    if (updatedName && updatedRole) {
      const updatedResource = {
        resourceId: resource.resourceId,
        resourceName: updatedName,
        resourceRole: updatedRole
      };

      this.resourceService.updateResource(updatedResource.resourceId, updatedResource).subscribe({
        next: () => {
          console.log('Resource updated successfully');
          this.loadResources();
        },
        error: (err: any) => console.error('Error updating resource:', err)
      });
    }
  }

  deleteResource(id: number) {
    if (confirm('Delete this resource?')) {
      this.resourceService.deleteResource(id).subscribe(() => this.loadResources());
    }
  }

  get filteredResources(): Resource[] {
    const term = this.searchTerm.toLowerCase();
    return this.resources.filter(
      (r) =>
        r.resourceName.toLowerCase().includes(term) ||
        r.resourceRole.toLowerCase().includes(term)
    );
  }
}
