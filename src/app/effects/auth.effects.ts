import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../Services/auth.service";
import { Router } from "@angular/router";
import { SharedService } from "../Services/shared.service";
import { catchError, exhaustMap, finalize, map } from "rxjs/operators";
import * as AuthActions from '../actions/auth.action';
import { AuthDTO } from "../Models/auth.dto";
import { of } from "rxjs";

@Injectable()
export class AuthEffects {
  private responseOK: boolean = false;
  private errorResponse: any;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.responseOK = false;
  }

  login$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.login),
        exhaustMap(({ credentials }) => 
          this.authService.login(credentials).pipe(
            map(( userToken ) => {
              const credentialsTemp: AuthDTO = {
                email: credentials.email,
                password: credentials.password,
                user_id: userToken.user_id,
                access_token: userToken.access_token,
              };
              return AuthActions.loginSuccess({ credentials: credentialsTemp });
            }),
            catchError((error) => {
              return of(AuthActions.loginFaliure({ payload: error }));
            }),
            finalize(async () => {
              this.sharedService.managementToast(
                'loginFeedback',
                this.responseOK,
                this.errorResponse
              ).subscribe(() => {
                if (this.responseOK) {
                  this.router.navigateByUrl('home');
                }
              });  
            })
        )
      )
    )    
  );

  loginSuccess$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map((user) => {
        this.responseOK = true;
      })
    ),
    { dispatch: false }
  );

  loginFaliure$ = createEffect(() => 
  this.actions$.pipe(
    ofType(AuthActions.loginFaliure),
    map(( error ) => {
      this.responseOK = false;
      this.errorResponse = error.payload.error;
      this.sharedService.errorLog(error.payload.error);
    })
  ),
  { dispatch: false }
);
}