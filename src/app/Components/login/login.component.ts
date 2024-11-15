import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthDTO } from 'src/app/Models/auth.dto';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { AuthService } from 'src/app/Services/auth.service';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginUser: AuthDTO;
  email: UntypedFormControl;
  password: UntypedFormControl;
  loginForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    private headerMenusService: HeaderMenusService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.loginUser = new AuthDTO('', '', '', '');

    this.email = new UntypedFormControl('', [
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
    ]);

    this.password = new UntypedFormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(16),
    ]);

    this.loginForm = this.formBuilder.group({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit(): void {}

  async login(): Promise<void> {
    let responseOK: boolean = false;
    let errorResponse: any;

    this.loginUser.email = this.email.value;
    this.loginUser.password = this.password.value;

    this.authService.login(this.loginUser).pipe(
      // Uso finalize porque al usar complete no funciona en caso de error
      finalize(() => {
        this.sharedService.managementToast(
          'loginFeedback',
          responseOK,
          errorResponse
        ).subscribe(() => {
          if (responseOK) {
            const headerInfo: HeaderMenus = {
              showAuthSection: true,
              showNoAuthSection: false,
            };
            // update options menu
            this.headerMenusService.headerManagement.next(headerInfo);
            this.router.navigateByUrl('home');
          }
        });
      })
    ).subscribe({
      next: (authToken) => {
        responseOK = true;
        this.loginUser.user_id = authToken.user_id;
        this.loginUser.access_token = authToken.access_token;
        // save token to localstorage for next requests
        this.localStorageService.set('user_id', this.loginUser.user_id);
        this.localStorageService.set('access_token', this.loginUser.access_token);
      },
      error: (error: any) => {
        responseOK = false;
        errorResponse = error.error;
        const headerInfo: HeaderMenus = {
          showAuthSection: false,
          showNoAuthSection: true,
        };
        this.headerMenusService.headerManagement.next(headerInfo);
  
        this.sharedService.errorLog(error.error);
      }
    });
  }
}
