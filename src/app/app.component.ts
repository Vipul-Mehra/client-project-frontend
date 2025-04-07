import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientService } from './client.service';
import { HttpClientModule } from '@angular/common/http'; // Ensure this import is present

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ClientListComponent, HttpClientModule], // HttpClientModule is imported here
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ClientService], // ClientService is provided at the component level
})
export class AppComponent {
  title = 'client-frontend';

  handleClick(){
    alert("hello button is working")
  }
}