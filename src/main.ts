import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    appConfig.providers,
    provideRouter(routes), // Ensure this is explicitly called here as well
  ],
}).catch((err) => console.error(err));
