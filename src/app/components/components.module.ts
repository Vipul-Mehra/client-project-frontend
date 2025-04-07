import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientListComponent } from './client-list/client-list.component';

@NgModule({
  declarations: [ClientListComponent],
  imports: [
    CommonModule
  ],
  exports: [ClientListComponent] // ✅ This is crucial for making it usable in other modules
})
export class ComponentsModule { }