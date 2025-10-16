// import { Component, OnInit } from '@angular/core';
// import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { AuthService } from 'src/app/auth/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-new-community-form',
//   templateUrl: './new-community-form.page.html',
//   styleUrls: ['./new-community-form.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class NewCommunityFormPage implements OnInit {
// communityName: string = '';
//   communityDescription: string =
//     'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.';

//   // You can also get userId from AuthService (adapt if your auth interface differs)
//   userId: string | null = null;

//   constructor(
//     private navCtrl: NavController,
//     private toastCtrl: ToastController,
//     private loadingCtrl: LoadingController,
//     private firebaseService: FirebaseChatService,
//     private authService: AuthService,
//     private router : Router
//   ) {}

//   ngOnInit() {
//     this.userId = this.authService?.authData?.userId ?? null;
//   }

//  async createCommunity() {
//   if (!this.communityName || !this.communityName.trim()) {
//     const t = await this.toastCtrl.create({
//       message: 'Please enter a community name.',
//       duration: 2000,
//       color: 'warning',
//     });
//     await t.present();
//     return;
//   }

//   if (!this.userId) {
//     const t = await this.toastCtrl.create({
//       message: 'User not authenticated. userId missing.',
//       duration: 3000,
//       color: 'danger',
//     });
//     await t.present();
//     console.error('createCommunity aborted: userId is null/undefined');
//     return;
//   }

//   const loading = await this.loadingCtrl.create({
//     message: 'Creating community...',
//   });
//   await loading.present();

//   try {
//     const communityId = `community_${Date.now()}`;

//     // create community
//     await this.firebaseService.createCommunity(
//       communityId,
//       this.communityName.trim(),
//       this.communityDescription || '',
//       this.userId
//     );

//     // add user to community (auto-joins General)
//     await this.firebaseService.addUserToCommunity(this.userId, communityId, true);

//     await loading.dismiss();

//     const toast = await this.toastCtrl.create({
//       message: 'Community created successfully',
//       duration: 2000,
//       color: 'success',
//     });
//     await toast.present();

//     // NAVIGATE to community detail and pass the id
//     this.router.navigate(['/community-detail'], { queryParams: { communityId } });

//   } catch (err: any) {
//     await loading.dismiss();

//     const msg = (err && (err.message || err.code)) ? `${err.message || err.code}` : JSON.stringify(err);
//     console.error('createCommunity failed:', err);

//     const t = await this.toastCtrl.create({
//       message: `Failed to create community: ${msg}`,
//       duration: 6000,
//       color: 'danger',
//     });
//     await t.present();
//   }
// }


//   // Trigger photo change (can be extended to camera/gallery)
//   changePhoto() {
//     // keep simple placeholder for now — integrate Camera/Picker later
//     this.toastCtrl
//       .create({
//         message: 'Change photo clicked! (Integrate Camera/Gallery here)',
//         duration: 2000,
//         color: 'primary',
//       })
//       .then(t => t.present());
//   }
// }


import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { firstValueFrom } from 'rxjs';
import { CreateCommunityPayload, CreateCommunityResponse } from 'src/types'; 
// <-- adjust this import if your interfaces are in a different file

@Component({
  selector: 'app-new-community-form',
  templateUrl: './new-community-form.page.html',
  styleUrls: ['./new-community-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class NewCommunityFormPage implements OnInit {
  communityName: string = '';
  communityDescription: string =
    'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.';

  // optional fields you may show in UI later
  communityDp: string = '';
  isPublic: boolean = true;
  maxMembers: number = 1000;
  canEditDp: boolean = true;
  canAddMembers: boolean = true;
  canAddGroups: boolean = true;

  userId: string | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;
  }

  async createCommunity() {
    if (!this.communityName || !this.communityName.trim()) {
      const t = await this.toastCtrl.create({
        message: 'Please enter a community name.',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    if (!this.userId) {
      const t = await this.toastCtrl.create({
        message: 'User not authenticated. userId missing.',
        duration: 3000,
        color: 'danger',
      });
      await t.present();
      console.error('createCommunity aborted: userId is null/undefined');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creating community...',
      backdropDismiss: false
    });
    await loading.present();

    const creatorIdNum = Number(this.userId);
    // generate firebase community id on client
    const firebaseCommunityId = `community_${Date.now()}`;

    try {
      // 1) Create in Firebase first
      try {
        await this.firebaseService.createCommunity(
          firebaseCommunityId,
          this.communityName.trim(),
          this.communityDescription || '',
          String(creatorIdNum)
        );

        // Add creator as member (auto-joins General)
        try {
          // await this.firebaseService.addUserToCommunity(String(creatorIdNum), firebaseCommunityId, true);
        } catch (addErr) {
          // don't block the flow if addUserToCommunity fails; warn and continue
          console.warn('addUserToCommunity failed (continuing):', addErr);
        }
      } catch (fbErr) {
        console.error('Failed to create community in Firebase:', fbErr);
        await loading.dismiss();
        const t = await this.toastCtrl.create({
          message: 'Failed to create community locally. Please try again.',
          duration: 4000,
          color: 'danger'
        });
        await t.present();
        return;
      }

      // 2) Build payload including Firebase_community_id and call backend API
      const payload: CreateCommunityPayload & { Firebase_community_id?: string } = {
        community_name: this.communityName.trim(),
        description: this.communityDescription || '',
        community_dp: this.communityDp || '',
        is_public: !!this.isPublic,
        max_members: this.maxMembers || 1000,
        can_edit_dp: !!this.canEditDp,
        can_add_members: !!this.canAddMembers,
        can_add_groups: !!this.canAddGroups,
        creatorId: creatorIdNum,
        firebase_community_id: firebaseCommunityId
      };

      try {
        const res: CreateCommunityResponse = await firstValueFrom(this.api.createCommunity(payload));
        if (!res || !res.status) {
          // API returned non-success: show warning but don't delete firebase entry
          // console.warn('Backend createCommunity returned non-success or no response', res);
          // const warn = await this.toastCtrl.create({
          //   message: 'Community created locally, but server registration failed. It may be synced later.',
          //   duration: 4000,
          //   color: 'success'
          // });
          // await warn.present();
        } else {
          // success: optional server-provided id handling
          const serverId = res.data && (res.data.community_id || res.data.id);
          if (serverId && String(serverId) !== firebaseCommunityId) {
            // If server returns a different canonical id and you want to reconcile,
            // you could update Firebase with server id or call a backend endpoint
            // to link. For now we only log it.
            //console.log('Server created community with id:', serverId);
          }
        }
      } catch (apiErr) {
        console.warn('createCommunity API call failed', apiErr);
        const toast = await this.toastCtrl.create({
          message: 'Community created locally, but failed to register on server.',
          duration: 4000,
          color: 'warning'
        });
        await toast.present();
      }

      // Final success UX: dismiss loader and navigate to community detail
      await loading.dismiss();
      const success = await this.toastCtrl.create({
        message: 'Community created successfully',
        duration: 2000,
        color: 'success'
      });
      await success.present();

      // navigate to community detail using firebaseCommunityId
      this.router.navigate(['/community-detail'], { queryParams: { communityId: firebaseCommunityId } });

    } catch (err: any) {
      // catch-all
      await loading.dismiss();
      console.error('createCommunity failed (unexpected):', err);
      const msg = (err && (err.message || err.code)) ? `${err.message || err.code}` : JSON.stringify(err);
      const t = await this.toastCtrl.create({
        message: `Failed to create community: ${msg}`,
        duration: 6000,
        color: 'danger'
      });
      await t.present();
    }
  }

  // placeholder — extend with camera/file picker if needed
  changePhoto() {
    this.toastCtrl.create({
      message: 'Change photo clicked! (Integrate Camera/Gallery here)',
      duration: 2000,
      color: 'primary'
    }).then(t => t.present());
  }
}
