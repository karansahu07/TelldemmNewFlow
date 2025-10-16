import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { EncryptionService } from '../services/encryption.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { Preferences } from '@capacitor/preferences';

interface AuthData {
  loggedIn: boolean;
  phone_number: string;
  userId: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _authData: AuthData | null = null;
  // private senderId : string | null = null;

  constructor(
    private api: ApiService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService
  ) {}

  /** Getter for components to check authentication state */
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /** Getter for auth data if needed */
  get authData(): AuthData | null {
    return this._authData;
  }
  get senderId(): string | null {
    return this._authData?.userId || null;
  }

  /** Send OTP */
  sendOtp(payload: { phone_number: string; country_code: string }): Promise<any> {
    // return this.api.post('/api/auth/send-otp_mb', payload).toPromise();
    return this.api.post('/api/auth/send-otp_mb_dev_new', payload).toPromise();//khusha

  }
  
  sendOtpDev(payload: { phone_number: string; country_code: string }): Promise<any> {
    return this.api.post('/api/auth/send-otp_mb_dev', payload).toPromise();
  }



  // /** Verify OTP & store in secure storage */
  // async verifyOtp(payload: { country_code: string; phone_number: string; otp_code: string }): Promise<{ success: boolean; userId?: number; message?: string }> {
  //   try {
  //     const res: any = await this.api.post('/api/auth/verify-otp_mb', payload).toPromise();

  //     if (res.status) {
  //       const senderPhone = `${payload.country_code}${payload.phone_number}`;
  //       const authData: AuthData = {
  //         loggedIn: true,
  //         phone_number: senderPhone,
  //         userId: res.user_id.toString(),
  //         name: res.name || undefined
  //       };

  //       // Store whole object in SecureStorage under "AUTH"
  //       await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

  //       // In-memory state
  //       this._authData = authData;
  //       this._isAuthenticated = true;

  //       // Generate and upload public key
  //       const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
  //       await this.api.post('/api/users/update-public-key', {
  //         user_id: res.user_id,
  //         public_key: publicKeyHex
  //       }).toPromise();

  //       return { success: true, userId: res.user_id };
  //     } else {
  //       return { success: false, message: res.message || 'Invalid OTP' };
  //     }
  //   } catch (error) {
  //     console.error('OTP verification failed:', error);
  //     return { success: false, message: 'OTP verification failed' };
  //   }
  // }


//   /** Verify OTP & store in secure storage */
// async verifyOtp(payload: { 
//   country_code: string; 
//   phone_number: string; 
//   otp_code: string;
//   device_details?: Array<{
//     device_uuid: string;
//     device_model: string;
//     os_name: string;
//     os_version: string;
//     app_version: string;
//   }>;
// }): Promise<{ success: boolean; userId?: number; message?: string }> {
//   try {
//     // ✅ Log the payload to debug device info
//     //console.log('📨 Sending Verify OTP Payload:', payload);

//     // Send to backend
//     const res: any = await this.api.post('/api/auth/verify-otp_mb', payload).toPromise();

//     if (res.status) {
//       const senderPhone = `${payload.country_code}${payload.phone_number}`;
//       const authData: AuthData = {
//         loggedIn: true,
//         phone_number: senderPhone,
//         userId: res.user_id.toString(),
//         name: res.name || undefined
//       };

//       // Store in secure storage
//       await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

//       // Update in-memory auth state
//       this._authData = authData;
//       this._isAuthenticated = true;

//       // Generate and upload public key
//       const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
//       await this.api.post('/api/users/update-public-key', {
//         user_id: res.user_id,
//         public_key: publicKeyHex
//       }).toPromise();

//       return { success: true, userId: res.user_id };
//     } else {
//       return { success: false, message: res.message || 'Invalid OTP' };
//     }
//   } catch (error) {
//     console.error('OTP verification failed:', error);
//     return { success: false, message: 'OTP verification failed' };
//   }
// }

/** Verify OTP & store in secure storage */
async verifyOtp(payload: { 
  country_code: string; 
  phone_number: string; 
  otp_code: string;
  device_details?: Array<{
    device_uuid: string;
    device_model: string;
    os_name: string;
    os_version: string;
    app_version: string;
  }>;
}): Promise<{ success: boolean; userId?: number; message?: string }> {
  try {
    //console.log('📨 Sending Verify OTP Payload:', payload);

    const res: any = await this.api.post('/api/auth/verify-otp_mb', payload).toPromise();

    // ✅ If API explicitly returns status: false
    if (!res.status) {
      return {
        success: false,
        message: res.message || 'Invalid or expired OTP'
      };
    }

    // ✅ On success, store auth data securely
    const senderPhone = `${payload.country_code}${payload.phone_number}`;
    const authData: AuthData = {
      loggedIn: true,
      phone_number: senderPhone,
      userId: res.user_id.toString(),
      name: res.name || undefined
    };

    await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

    this._authData = authData;
    this._isAuthenticated = true;

    // ✅ Generate and upload ECC public key
    const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
    await this.api.post('/api/users/update-public-key', {
      user_id: res.user_id,
      public_key: publicKeyHex
    }).toPromise();

    return {
      success: true,
      userId: res.user_id,
      message: res.message || 'OTP verified successfully'
    };

  } catch (error: any) {
    console.error('OTP verification failed:', error);

    // ✅ Return backend error message if available
    const apiMessage = error?.error?.message || error?.message || 'OTP verification failed';
    return { success: false, message: apiMessage };
  }
}

/** Verify device API */
async verifyDevice(payload: any): Promise<any> {
    // Replace with your full backend URL if needed
    return this.api.post('/api/auth/verify-device', payload).toPromise();
  }

  /** Update user name in auth data */
  async updateUserName(name: string): Promise<void> {
    if (this._authData) {
      const updatedAuthData: AuthData = {
        ...this._authData,
        name: name
      };

      // Update secure storage
      await this.secureStorage.setItem('AUTH', JSON.stringify(updatedAuthData));
      
      // Update in-memory state
      this._authData = updatedAuthData;
    }
  }

  /** Update complete auth data (useful for profile setup) */
  async updateAuthData(updates: Partial<AuthData>): Promise<void> {
    if (this._authData) {
      const updatedAuthData: AuthData = {
        ...this._authData,
        ...updates
      };

      // Update secure storage
      await this.secureStorage.setItem('AUTH', JSON.stringify(updatedAuthData));
      
      // Update in-memory state
      this._authData = updatedAuthData;
    }
  }

  /** Get user name */
  getUserName(): string | undefined {
    return this._authData?.name;
  }

  /** Hydrate auth data on app start */
  async hydrateAuth(): Promise<void> {
    try {
      const stored = await this.secureStorage.getItem('AUTH');
      if (stored) {
        const parsed: AuthData = JSON.parse(stored);

        // Validate data integrity
        if (parsed.loggedIn && parsed.phone_number && parsed.userId) {
          this._authData = parsed;
          this._isAuthenticated = true;
          return;
        }
      }
      // If invalid or missing → clear
      await this.clearAuth();
    } catch (err) {
      console.warn('Auth hydration failed:', err);
      await this.clearAuth();
    }
  }

  /** Logout & clear everything */
  async logout(): Promise<void> {
    await this.clearAuth();
  }

  /** Internal: Clear both secure storage & memory */
  private async clearAuth(): Promise<void> {
    await Preferences.clear();
    this._authData = null;
    this._isAuthenticated = false;
  }
}