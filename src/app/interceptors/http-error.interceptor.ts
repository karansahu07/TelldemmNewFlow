import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private toastController: ToastController) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // 👇 Check for server down (status 0 or network unreachable)
        if (!navigator.onLine || error.status === 0) {
          this.toastController.create({
            message: ' Server is DOWN....unreachable, Please try later.',
            duration: 3000,
            color: 'danger',
            position: 'bottom',
          }).then(toast => toast.present());
        }

        // Always return the error
        return throwError(() => error);
      })
    );
  }
}
