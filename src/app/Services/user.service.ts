import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDTO } from '../Models/user.dto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private urlBlogUocApi: string;
  private controller: string;

  constructor(private http: HttpClient) {
    this.controller = 'users';
    this.urlBlogUocApi = environment.apiUrl + this.controller;
  }

  register(user: UserDTO): Promise<UserDTO> {
    return this.http.post<UserDTO>(this.urlBlogUocApi, user).toPromise();
  }

  updateUser(userId: string, user: UserDTO): Promise<UserDTO> {
    return this.http
      .put<UserDTO>(this.urlBlogUocApi + '/' + userId, user)
      .toPromise();
  }

  getUSerById(userId: string): Promise<UserDTO> {
    return this.http
      .get<UserDTO>(this.urlBlogUocApi + '/' + userId)
      .toPromise();
  }
}
