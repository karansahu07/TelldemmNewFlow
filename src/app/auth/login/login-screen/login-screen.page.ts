import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, IonInputOtp } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Device, DeviceInfo } from '@capacitor/device';
import { VersionCheck } from 'src/app/services/version-check';
import { Capacitor } from '@capacitor/core';



@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login-screen.page.html',
  styleUrls: ['./login-screen.page.scss'],
})
export class LoginScreenPage {
  phoneNumber = '';
  countryCode = '+91';
  showOtpPopup = false;
  showConfirmPopup = false;
  otpValue: string = '';
  timer: number = 60;
  timerInterval: any;
  email: string = '';

  countries = [
  { name: 'India', code: '+91', disabled: false },
  { name: 'Pakistan', code: '+92', disabled: false },
  { name: 'UK', code: '+44', disabled: false },
  { name: 'UAE', code: '+971', disabled: false },
  // { name: 'USA', code: '+1', disabled: true },
  // { name: 'Canada', code: '+1', disabled: true },
  // { name: 'Germany', code: '+49', disabled: true },
  // { name: 'France', code: '+33', disabled: true },
  // { name: 'Brazil', code: '+55', disabled: true },
  // { name: 'South Africa', code: '+27', disabled: true },
  // { name: 'Russia', code: '+7', disabled: true },
  // { name: 'China', code: '+86', disabled: true },
  // { name: 'Japan', code: '+81', disabled: true },
  // { name: 'Singapore', code: '+65', disabled: true },
  // { name: 'New Zealand', code: '+64', disabled: true },
  // { name: 'Mexico', code: '+52', disabled: true },
  // { name: 'Italy', code: '+39', disabled: true },
  // { name: 'Spain', code: '+34', disabled: true },
  // { name: 'Netherlands', code: '+31', disabled: true },
  // { name: 'Sweden', code: '+46', disabled: true }
];

  @ViewChild('otpInput') otpInput!: IonInputOtp;
  isLoading: boolean = false;
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
  selectedCountry: string | null = null;


  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private versionCheck: VersionCheck
    // private secureStorage: SecureStorageService
  ) { }

  async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
    const toast = await this.toastController.create({ message, duration: 2000, color });
    toast.present();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  isPhoneValid(): boolean {
    return /^\d{10}$/.test(this.phoneNumber.trim());
  }

  isEmailValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email.trim());
  }

  isOtpComplete(): boolean {
    return this.otpValue.length === 6;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${('0' + minutes).slice(-2)} : ${('0' + seconds).slice(-2)}`;
  }

  startTimer() {
    this.timer = 60;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.timerInterval);
    }, 1000);
  }

  resendOtp() {
    if (this.timer === 0) {
      this.sendOtp();
    }
  }

  onCountryChange(event: any) {
  const selectedCountryName = event.target.value;
  const selected = this.countries.find(c => c.name === selectedCountryName);
  
  if (selected && !selected.disabled) {
    this.selectedCountry = selectedCountryName;
    this.countryCode = selected.code;
  } else if (selected && selected.disabled) {
    // Reset to India if disabled country selected
    this.selectedCountry = 'India';
    this.countryCode = '+91';
    this.showToast('This country is currently not supported', 'dark');
    
    // Reset dropdown to India
    setTimeout(() => {
      const selectElement = event.target;
      selectElement.value = 'India';
    }, 100);
  }
  
  //console.log(`✅ UI Country Code: ${this.countryCode}, Payload will use: +91`);
}

  onAgreeClick() {
    this.phoneNumber = this.phoneNumber.trim();
    if (!this.isPhoneValid()) {
      this.showToast('Please enter a valid 10-digit mobile number.', 'danger');
      return;
    }
    this.showConfirmPopup = true;
  }

  onEdit() {
    this.showConfirmPopup = false;
  }

  async onConfirm() {
    this.showConfirmPopup = false;
    this.isSendingOtp = true;
    await this.sendOtp();
    this.isSendingOtp = false;
  }

  async sendOtp() {
  const payload = {
    phone_number: this.phoneNumber.trim(),
    country_code: this.countryCode
  };

  try {
    //console.log('📨 Sending OTP payload:', payload);
    const res = await this.authService.sendOtp(payload);
    //console.log('📬 OTP API Response:', res);

    if (res.status) {
      this.showToast('OTP sent successfully.', 'success');
      this.showOtpPopup = true;
      this.startTimer();
      // Clear previous OTP value
      this.otpValue = '';
      // Focus the OTP input after a short delay
      setTimeout(() => {
        if (this.otpInput) {
          this.otpInput.setFocus();
        }
      }, 300);
    } else {
      this.showToast(res.message || 'Failed to send OTP.', 'danger');
    }
  } catch (err) {
    console.error('❌ OTP API Error:', err);
    this.showToast('Failed to send OTP. Try again.', 'danger');
  }
}

  onOtpChange(event: any) {
    this.otpValue = event.detail.value;
  }

//   async goToHome() {
//   if (!this.isOtpComplete()) {
//     this.showToast('Please enter the complete 6-digit OTP.');
//     return;
//   }

//   this.isVerifyingOtp = true;

//   const payload = {
//     country_code: '+91',
//     phone_number: this.phoneNumber.trim(),
//     otp_code: this.otpValue
//   };

//   try {
//     //console.log('📨 Verifying OTP payload:', payload);
//     const result = await this.authService.verifyOtp(payload);
//     this.isVerifyingOtp = false;

//     if (result.success) {
//       this.showToast('Login successful!', 'success');
      
//       this.router.navigateByUrl('/profile-setup', { replaceUrl: true });
//     } else {
//       this.showToast(result.message || 'Invalid OTP', 'danger');
//     }
//   } catch (err) {
//     this.isVerifyingOtp = false;
//     this.showToast('Verification failed. Please try again.', 'danger');
//     console.error(err);
//   }
// }
async goToHome() {
  if (!this.isOtpComplete()) {
    this.showToast('Please enter the complete 6-digit OTP.');
    return;
  }

  this.isVerifyingOtp = true;

  try {
    // 1️⃣ Get device info (with web fallback)
    let info: any;
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      // Fallback for web platform
      info = {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
        operatingSystem: 'Web',
        osVersion: 'N/A', // Or parse from navigator.userAgent if needed
        uuid: localStorage.getItem('device_uuid') || crypto.randomUUID()
      };
      // Persist UUID if new
      if (!localStorage.getItem('device_uuid')) {
        localStorage.setItem('device_uuid', info.uuid);
      }
    } else {
      info = await Device.getInfo();
    }
    //console.log('Device info:', info);

    // 2️⃣ Get current app version from VersionCheck (with web fallback)
    let appVersion = '00'; // Default fallback
    if (platform !== 'web') {
      try {
        const versionResult = await this.versionCheck.checkVersion();
        appVersion = versionResult.currentVersion || '00';
      } catch (versionErr) {
        console.warn('Version check failed:', versionErr);
        appVersion = '00';
      }
    } else {
      // For web, you could read from package.json or manifest.json
      // Example: hardcode or use a service to get it
      appVersion = 'web.1.0.0'; // Adjust as needed
    }
    //console.log('App version:', appVersion);

    // 3️⃣ Use persistent UUID
    let uuid = localStorage.getItem('device_uuid') || info.uuid || crypto.randomUUID();
    if (!localStorage.getItem('device_uuid')) {
      localStorage.setItem('device_uuid', uuid);
    }

    // 4️⃣ Create device payload
    const devicePayload = {
      device_uuid: uuid,
      device_model: info.model,
      os_name: info.operatingSystem,
      os_version: info.osVersion,
      app_version: appVersion
    };

    // 5️⃣ Prepare OTP verification payload
    const payload = {
      country_code: this.countryCode,
      phone_number: this.phoneNumber.trim(),
      otp_code: this.otpValue,
      device_details: [devicePayload]
    };

    //console.log('📨 Verifying OTP payload:', payload);

    // 6️⃣ Call backend API
    const result = await this.authService.verifyOtp(payload);
    this.isVerifyingOtp = false;

    if (result.success) {
      this.showToast('Login successful!', 'success');
      this.router.navigateByUrl('/profile-setup', { replaceUrl: true });
    } else {
      this.showToast(result.message || 'Invalid OTP', 'danger');
    }
  } catch (err) {
    this.isVerifyingOtp = false;
    console.error('Error in goToHome:', err); // Enhanced logging
    this.showToast('Verification failed. Please try again.', 'danger');
  }
}


}