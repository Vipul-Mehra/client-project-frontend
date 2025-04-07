import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import this
import { AppComponent } from './app.component';
import { ClientListComponent } from './components/client-list/client-list.component';

@NgModule({
  declarations: [AppComponent, ClientListComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
