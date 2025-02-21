import {CanActivateFn, Router} from '@angular/router';
import {map, take} from 'rxjs';
import {Inject} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const afAuth = Inject(AngularFireAuth);
  const router = Inject(Router);


  return afAuth.authState.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true; // Allow access if the user is logged in
      } else {
        router.navigate(['/login']); // Redirect to login if not logged in
        return false;
      }
    })
  );
};
