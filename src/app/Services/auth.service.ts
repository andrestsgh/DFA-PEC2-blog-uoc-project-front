import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDTO } from '../Models/auth.dto';
import { environment } from 'src/environments/environment';

interface AuthToken {
  user_id: string;
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlBlogUocApi: string;
  private controller: string;

  constructor(private http: HttpClient) {
    this.controller = 'auth';
    this.urlBlogUocApi = environment.apiUrl + this.controller;
  }

  login(auth: AuthDTO): Promise<AuthToken> {
    return this.http.post<AuthToken>(this.urlBlogUocApi, auth).toPromise();
  }
}
