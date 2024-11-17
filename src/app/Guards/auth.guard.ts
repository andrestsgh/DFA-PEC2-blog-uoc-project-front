import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthState } from '../reducers/auth.reducer';
import { Store } from '@ngrx/store';
import { selectAccessToken } from '../selectors/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private store: Store<AuthState>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    return new Observable<boolean>((observer) => {
      // Devuelvo un Observable que consulta el accessToken y en caso de no existir redirige a /login
      this.store.select(selectAccessToken).subscribe((accessToken) => {
        if (accessToken) {
          observer.next(true);
        } else {
          this.router.navigate(['/login']);
          observer.next(false);
        }
      });
    });
  }
}
