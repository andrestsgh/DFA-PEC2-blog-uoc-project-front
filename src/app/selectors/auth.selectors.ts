import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUserId = createSelector(
  selectAuthState,
  (state: AuthState) => state.credentials.user_id
);

export const selectAccessToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.credentials.access_token
);

export const selectCredentials = createSelector(
  selectAuthState,
  (state: AuthState) => state.credentials
);