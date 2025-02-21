import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {from, Observable, switchMap} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {config} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private apiUrl = config.apiUrl;

  constructor(private http: HttpClient,  private afAuth: AngularFireAuth) {}

  getContacts(): Observable<any> {
    return from(this.afAuth.currentUser).pipe(
      switchMap((user) => {
        if (user) {
          return this.http.get(`${this.apiUrl}/contacts/${user.uid}`);
        } else {
          throw new Error('User not authenticated');
        }
      })
    );
  }
}
