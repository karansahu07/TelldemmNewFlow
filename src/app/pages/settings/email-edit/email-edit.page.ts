import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';

// const USER_ID = 52; // replace with logged-in user ID from auth/session

@Component({
  selector: 'app-email-edit',
  templateUrl: './email-edit.page.html',
  styleUrls: ['./email-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class EmailEditPage implements OnInit {
  emailForm: FormGroup;
  isEditing = false;
  originalEmail = '';

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private userService: ApiService, // your ApiService
    private translate: TranslateService,
    private authService:AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    });
  }

  ngOnInit() {
    this.loadEmail();
  }

  get emailControl(): FormControl {
    return this.emailForm.get('email') as FormControl;
  }



  /** Load email from service */
  loadEmail() {
      const uidStr = this.authService.authData?.userId;

    const uid = Number(uidStr);
    this.userService.getUserEmail(uid).subscribe({
      next: (res) => {
        // {"user_id":"86","email":null}
         const email = res.email ? res.email : 'you@example.com';
         this.originalEmail = email;
         this.emailForm.patchValue({ email });
        // this.originalEmail = res.email;
        // this.emailForm.patchValue({ email: res.email });
      },
      error: async () => {
        // localized toast for load failure
        this.translate.get('emailEdit.toast.loadFailed').subscribe(async (msg: string) => {
          const toast = await this.toastCtrl.create({
            message: msg,
            color: 'danger',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        });
      },
    });
  }

  /** Switch to edit mode */
  editEmail() {
    this.isEditing = true;
    // reset touched/pristine so validation messages don't show immediately
    this.emailControl.markAsPristine();
    this.emailControl.markAsUntouched();
  }

  /** Save email via service */
  saveEmail() {
    if (this.emailForm.invalid) return;
    const newEmail = this.emailForm.value.email;
   const uidStr = this.authService.authData?.userId;

    const uid = Number(uidStr);
    this.userService.updateUserEmail(uid, newEmail).subscribe({
      next: async (res) => {
        this.originalEmail = res.email;
        this.isEditing = false;

        // localized success toast (uses savedSuccess which may accept interpolation)
        this.translate.get('emailEdit.savedSuccess', { email: res.email }).subscribe(async (msg: string) => {
          const toast = await this.toastCtrl.create({
            message: msg,
            color: 'success',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        });
      },
      error: async (err) => {
        let msg = 'Failed to update email';
        if (err.status === 409) msg = 'Email already in use';
        if (err.status === 404) msg = 'User not found';

        const toast = await this.toastCtrl.create({
          message: msg,
          color: 'danger',
          duration: 2000,
        });
        toast.present();
      },
    });
  }

  /** Cancel edit and reset */
  cancelEdit() {
    this.isEditing = false;
    this.emailForm.reset({ email: this.originalEmail });
  }
}
