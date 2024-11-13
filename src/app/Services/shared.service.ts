import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';

export interface ResponseError {
  statusCode: number;
  message: string;
  messageDetail: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  managementToast(
    element: string, 
    validRequest: boolean, 
    error?: ResponseError
  ): Observable<void> {
    const toastMsg = document.getElementById(element);
  
    if (toastMsg) {
      if (validRequest) {
        toastMsg.className = 'show requestOk';
        toastMsg.textContent = 'Form submitted successfully.';
      } else {
        toastMsg.className = 'show requestKo';
        if (error?.messageDetail) {
          toastMsg.textContent =
            'Error on form submitted, show logs. Message: ' +
            error?.message +
            '. Message detail: ' +
            error?.messageDetail +
            '. Status code: ' +
            error?.statusCode;
        } else {
          toastMsg.textContent =
            'Error on form submitted, show logs. Message: ' +
            error?.message +
            '. Status code: ' +
            error?.statusCode;
        }
      }
      
      return of(null).pipe(
        switchMap(() => timer(2500)),
        tap(() => {
          toastMsg.className = toastMsg.className.replace('show', '');
        }),
        // Convierte el último valor emitido en `undefined` para hacerlo compatible con Observable<void>
        mapTo(undefined)
      );
    }
  
    // Devuelve un Observable<void> vacío si no hay mensaje
    return of();
  }

  errorLog(error: ResponseError): void {
    console.error('path:', error.path);
    console.error('timestamp:', error.timestamp);
    console.error('message:', error.message);
    console.error('messageDetail:', error.messageDetail);
    console.error('statusCode:', error.statusCode);
  }

  async wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
