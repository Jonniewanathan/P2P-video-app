import { Component } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  login() {
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        this.router.navigate(['/data']); // Redirect to the data display page
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  }

}
