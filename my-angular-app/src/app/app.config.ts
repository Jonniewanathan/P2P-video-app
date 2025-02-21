import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {config} from '../environments/environment';
import {FIREBASE_OPTIONS} from '@angular/fire/compat';
import {provideHttpClient} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: FIREBASE_OPTIONS, useValue: config.firebase },
    provideFirebaseApp(() => initializeApp(config.firebase)),
    provideAuth(() => getAuth())
  ]
};
