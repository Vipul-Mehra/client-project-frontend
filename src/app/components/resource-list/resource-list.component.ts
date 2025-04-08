import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-xl font-bold mb-2">Resources</h2>
      <input [(ngModel)]="searchTerm" placeholder="Search resources..." class="p-2 border mb-4 w-full" />
      <form (submit)="addResource()" class="flex gap-2 mb-4">
        <input [(ngModel)]="newResource.name" name="name" placeholder="Resource Name" class="p-2 border" required />
        <input [(ngModel)]="newResource.skill" name="skill" placeholder="Skill" class="p-2 border" required />
        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Add</button>
      </form>
      <table class="w-full border">
        <thead>
          <tr>
            <th class="border p-2">Name</th>
            <th class="border p-2">Skill</th>
            <th class="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let resource of filteredResources()">
            <td class="border p-2">{{ resource.name }}</td>
            <td class="border p-2">{{ resource.skill }}</td>
            <td class="border p-2">
              <button (click)="editResource(resource)" class="text-yellow-600">Edit</button>
              <button (click)="deleteResource(resource.id)" class="text-red-600 ml-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ResourceListComponent implements OnInit {
  resources: any[] = [];
  newResource = { name: '', skill: '' };
  searchTerm = '';

  constructor(private resourceService: ResourceService) {}

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.resourceService.getResources().subscribe(data => this.resources = data);
  }

  addResource() {
    this.resourceService.addResource(this.newResource).subscribe(() => {
      this.newResource = { name: '', skill: '' };
      this.loadResources();
    });
  }

  editResource(resource: any) {
    const updatedName = prompt('New name', resource.name);
    const updatedSkill = prompt('New skill', resource.skill);
    if (updatedName && updatedSkill) {
      const updated = { ...resource, name: updatedName, skill: updatedSkill };
      this.resourceService.updateResource(updated.id, updated).subscribe(() => this.loadResources());
    }
  }

  deleteResource(id: number) {
    if (confirm('Delete this resource?')) {
      this.resourceService.deleteResource(id).subscribe(() => this.loadResources());
    }
  }

  filteredResources() {
    return this.resources.filter(r => r.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
}
