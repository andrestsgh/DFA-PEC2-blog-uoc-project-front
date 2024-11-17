import { ActionReducerMap } from "@ngrx/store";
import { AuthEffects } from "./effects/auth.effects";
import * as AuthReducer from "./reducers/auth.reducer";
export interface AppState{
    auth: AuthReducer.AuthState;
}

export const appReducers: ActionReducerMap<AppState> = {
    auth: AuthReducer.authReducer,
}

export const EffectsArray: any[] = [AuthEffects];