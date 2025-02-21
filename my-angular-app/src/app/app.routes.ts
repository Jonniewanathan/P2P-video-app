import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {DataDisplayComponent} from './components/data-display/data-display.component';
import {AuthGuard} from '@angular/fire/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'data', component: DataDisplayComponent, canActivate: [AuthGuard] },
];
