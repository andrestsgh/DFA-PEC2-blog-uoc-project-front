import { createAction, props } from "@ngrx/store";
import { AuthDTO } from "../Models/auth.dto";
import { HttpErrorResponse } from "@angular/common/http";

export const login = createAction(
    '[Login Page] Login',
    props<{credentials: AuthDTO}>()
);

export const loginSuccess = createAction(
    '[Login Page] Login Success',
    props<{credentials: AuthDTO}>()
);

export const loginFaliure = createAction(
    '[Login Page] Login Faliure',
    props<{ payload: HttpErrorResponse }>()
);

export const logout = createAction('[Login Page] Logout');