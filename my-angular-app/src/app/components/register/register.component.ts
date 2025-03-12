import { Component } from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule
  ],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  async onRegister() {
    try {
      const response = await this.userService.register(this.email, this.password).toPromise();
      console.log('Registration successful:', response);
      alert('Registration successful!');
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = 'Registration failed. Please try again.';
    }
  }
}
