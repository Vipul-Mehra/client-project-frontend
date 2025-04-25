import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For Angular directives like *ngFor, *ngIf
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { ResourceService } from '../../services/resource.service';
import { Resources } from '../../model/resource'; // Corrected import

@Component({
  selector: 'app-resource-list',
  standalone: true, // If using standalone components
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule here
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.css'],
})
export class ResourceListComponent {
  resources: Resources[] = []; // Use 'Resources' instead of 'Resources'
  newResource: Resources = { id: 0, name: '', role: '' }; // Use 'Resources' instead of 'Resources'
  searchTerm = '';
  editingResource: Resources | null = null; // Use 'Resources' instead of 'Resources'

  constructor(private resourceService: ResourceService) {}

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.resourceService.getResources().subscribe(
      (data) => {
        console.log('Fetched resources:', data); // Log fetched data for debugging
        this.resources = data;
      },
      (error) => {
        console.error('Error fetching resources:', error); // Log any errors
      }
    );
  }

  addResource() {
    this.resourceService.addResource(this.newResource).subscribe(() => {
      this.newResource = { id: 0, name: '', role: '' }; // Reset form after submission
      this.loadResources(); // Reload resources
    });
  }

  editResource(resource: Resources) { // Use 'Resource' instead of 'Resources'
    this.editingResource = { ...resource }; // Create a copy of the resource for editing
  }

  updateResource() {
    if (this.editingResource) {
      this.resourceService.updateResource(this.editingResource.id, this.editingResource).subscribe(() => {
        this.loadResources(); // Reload resources
        this.editingResource = null; // Reset the editing resource after update
      });
    }
  }

  cancelEdit() {
    this.editingResource = null; // Reset the editing resource when cancel is clicked
  }

  deleteResource(id: number) {
    if (confirm('Delete this resource?')) {
      this.resourceService.deleteResource(id).subscribe(() => this.loadResources());
    }
  }

  get filteredResources(): Resources[] { // Use 'Resource' instead of 'Resources'
    const term = this.searchTerm.toLowerCase();
    return this.resources.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(term) ||
        (r.role || '').toLowerCase().includes(term)
    );
  }
}