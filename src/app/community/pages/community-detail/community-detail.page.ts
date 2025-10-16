// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   IonicModule,
//   NavController,
//   PopoverController,
//   ModalController,
//   ToastController
// } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FirebaseChatService } from '../../../services/firebase-chat.service';
// import { get, ref, getDatabase, update } from 'firebase/database';
// import { AuthService } from 'src/app/auth/auth.service'; // adjust if your path is different

// // Popover component you already have
// import { CommunityMenuPopoverComponent } from '../../components/community-menu-popover/community-menu-popover.component';

// // Group preview modal component (new)
// import { GroupPreviewModalComponent } from '../../components/group-preview-modal/group-preview-modal.component';

// @Component({
//   selector: 'app-community-detail',
//   templateUrl: './community-detail.page.html',
//   styleUrls: ['./community-detail.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule]
// })
// export class CommunityDetailPage implements OnInit {
//   communityId: string | null = null;
//   community: any = null;
//   announcementGroup: any = null;
//   groupsIn: any[] = [];
//   groupsAvailable: any[] = [];
//   loading = false;

//   memberCount = 0;
//   groupCount = 0;

//   currentUserId: string = '';
//   currentUserName: string = '';
//   currentUserPhone: string = '';

//   constructor(
//     private navCtrl: NavController,
//     private route: ActivatedRoute,
//     private router: Router,
//     private firebaseService: FirebaseChatService,
//     private popoverCtrl: PopoverController,
//     private modalCtrl: ModalController,
//     private toastCtrl: ToastController,
//     private authService: AuthService
//   ) {}

//   ngOnInit() {
//     // prefer authService, fallback localStorage (safe)
//     this.currentUserId = (this.authService?.authData?.userId) ? String(this.authService.authData.userId) : (localStorage.getItem('userId') || '');
//     this.currentUserName = (this.authService?.authData?.name) ? String(this.authService.authData.name) : (localStorage.getItem('name') || '');
//     this.currentUserPhone = (this.authService?.authData?.phone_number) ? String(this.authService.authData.phone_number) : (localStorage.getItem('phone') || '');

//     this.route.queryParams.subscribe(params => {
//       const cid = params['communityId'] || params['id'];
//       if (!cid) return;
//       this.communityId = cid;
//       this.loadCommunityDetail();
//     });
//   }

//   async loadCommunityDetail() {
//     if (!this.communityId) return;
//     this.loading = true;
//     try {
//       const commSnap = await get(ref(this.firebaseService['db'], `communities/${this.communityId}`));
//       if (!commSnap.exists()) {
//         this.community = null;
//         this.memberCount = 0;
//         this.groupCount = 0;
//         this.loading = false;
//         return;
//       }
//       this.community = commSnap.val();

//       this.memberCount = this.community.membersCount ?? (this.community.members ? Object.keys(this.community.members).length : 0);
//       this.groupCount = this.community.groups ? Object.keys(this.community.groups).length : 0;

//       const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);

//       this.announcementGroup = null;
//       this.groupsIn = [];
//       this.groupsAvailable = [];

//       for (const gid of groupIds) {
//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (!g) continue;

//         const groupObj = {
//           id: gid,
//           name: g.name || 'Unnamed group',
//           type: g.type || 'normal',
//           lastMessage: g.lastMessage || null,
//           membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
//           rawMembers: g.members || null,
//           createdBy: g.createdBy || g.created_by || ''
//         };

//         let isMember = false;
//         try {
//           if (!this.currentUserId) isMember = false;
//           else if (groupObj.rawMembers) isMember = Object.prototype.hasOwnProperty.call(groupObj.rawMembers, this.currentUserId);
//           else isMember = false;
//         } catch {
//           isMember = false;
//         }

//         if (groupObj.type === 'announcement' && !this.announcementGroup) {
//           this.announcementGroup = groupObj;
//         } else {
//           if (isMember) this.groupsIn.push(groupObj);
//           else this.groupsAvailable.push(groupObj);
//         }
//       }

//       // Ensure "General" is near top
//       this.groupsIn.sort((a, b) => {
//         if (a.name === 'General') return -1;
//         if (b.name === 'General') return 1;
//         return (a.name || '').localeCompare(b.name || '');
//       });
//       this.groupsAvailable.sort((a, b) => {
//         if (a.name === 'General') return -1;
//         if (b.name === 'General') return 1;
//         return (a.name || '').localeCompare(b.name || '');
//       });
//     } catch (err) {
//       console.error('loadCommunityDetail error', err);
//     } finally {
//       this.loading = false;
//     }
//   }

//   goToaddgroupcommunity() {
//     this.router.navigate(['/add-group-community'], {
//       queryParams: { communityId: this.communityId }
//     });
//   }

//   async openGroupPreview(group: any) {
//     if (!group) return;

//     // const modal = await this.modalCtrl.create({
//     //   component: GroupPreviewModalComponent,
//     //   componentProps: {
//     //     group,
//     //     communityName: this.community?.name || '',
//     //     currentUserId: this.currentUserId,
//     //     currentUserName: this.currentUserName,
//     //     currentUserPhone: this.currentUserPhone
//     //   },
//     //   cssClass: 'group-preview-modal'
//     // });

//     const modal = await this.modalCtrl.create({
//   component: GroupPreviewModalComponent,
//   componentProps: {
//     group,
//     communityName: this.community?.name || '',
//     // communityCreatedByName: this.community?.createdByName,
//     currentUserId: this.currentUserId,
//     currentUserName: this.currentUserName,
//     currentUserPhone: this.currentUserPhone
//   },
//   cssClass: 'group-preview-modal'
// });

//     await modal.present();
//     const { data } = await modal.onDidDismiss();

//     if (data && data.action === 'join' && data.groupId) {
//       await this.joinGroup(data.groupId);
//     }
//   }

//   async joinGroup(groupId: string) {
//     if (!this.currentUserId) {
//       const t = await this.toastCtrl.create({ message: 'Please login to join group', duration: 1800, color: 'danger' });
//       await t.present();
//       return;
//     }

//     try {
//       const db = getDatabase();
//       const groupSnap = await get(ref(db, `groups/${groupId}`));
//       if (!groupSnap.exists()) {
//         const t = await this.toastCtrl.create({ message: 'Group not found', duration: 1800, color: 'danger' });
//         await t.present();
//         return;
//       }
//       const groupData = groupSnap.val();

//       if (groupData.members && Object.prototype.hasOwnProperty.call(groupData.members, this.currentUserId)) {
//         const t = await this.toastCtrl.create({ message: 'You are already a member', duration: 1400, color: 'medium' });
//         await t.present();
//         return;
//       }

//       const now = Date.now();
//       const memberDetails = {
//         name: this.currentUserName || '',
//         phone_number: this.currentUserPhone || '',
//         role: 'member',
//         status: 'active',
//         joinedAt: now
//       };

//       const updates: any = {};
//       updates[`/groups/${groupId}/members/${this.currentUserId}`] = memberDetails;
//       const existingCount = groupData.membersCount || (groupData.members ? Object.keys(groupData.members).length : 0);
//       updates[`/groups/${groupId}/membersCount`] = (existingCount + 1);
//       updates[`/users/${this.currentUserId}/joinedGroups/${groupId}`] = true;

//       await update(ref(db), updates);

//       const idx = this.groupsAvailable.findIndex(g => g.id === groupId);
//       if (idx > -1) {
//         const g = this.groupsAvailable.splice(idx, 1)[0];
//         g.membersCount = (existingCount + 1);
//         g.rawMembers = g.rawMembers || {};
//         g.rawMembers[this.currentUserId] = memberDetails;
//         this.groupsIn.unshift(g);
//       } else {
//         await this.loadCommunityDetail();
//       }

//       const t = await this.toastCtrl.create({ message: `Joined ${groupData.name || 'group'}`, duration: 1600, color: 'success' });
//       await t.present();
//     } catch (err) {
//       console.error('joinGroup error', err);
//       const t = await this.toastCtrl.create({ message: 'Failed to join group', duration: 1800, color: 'danger' });
//       await t.present();
//     }
//   }

//   openGroupChat(groupId: string, groupName?: string) {
//     const isMember = this.groupsIn.some(g => g.id === groupId) || (this.announcementGroup && this.announcementGroup.id === groupId);
//     if (!isMember) {
//       const grp = this.groupsAvailable.find(g => g.id === groupId) || { id: groupId, name: groupName };
//       this.openGroupPreview(grp);
//       return;
//     }

//     this.router.navigate(['/community-chat'], {
//       queryParams: {
//         receiverId: groupId,
//         isGroup: true,
//         communityId: this.communityId
//       }
//     });
//   }

//   back() {
//     this.navCtrl.back();
//   }

//   async presentPopover(ev: any) {
//     const pop = await this.popoverCtrl.create({
//       component: CommunityMenuPopoverComponent,
//       event: ev,
//       translucent: true
//     });

//     await pop.present();

//     const { data } = await pop.onDidDismiss();
//     if (!data || !data.action) return;

//     const action: string = data.action;
//     switch (action) {
//       case 'info':
//         this.router.navigate(['/community-info'], { queryParams: { communityId: this.communityId } });
//         break;
//       case 'invite':
//         this.router.navigate(['/invite-members'], { queryParams: { communityId: this.communityId } });
//         break;
//       case 'settings':
//         this.router.navigate(['/community-settings'], { queryParams: { communityId: this.communityId } });
//         break;
//       default:
//         break;
//     }
//   }
// }




import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  NavController,
  PopoverController,
  ModalController,
  ToastController
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseChatService } from '../../../services/firebase-chat.service';
import { get, ref, getDatabase, update, Database } from 'firebase/database';
import { AuthService } from 'src/app/auth/auth.service'; // adjust if your path is different

// Popover component you already have
import { CommunityMenuPopoverComponent } from '../../components/community-menu-popover/community-menu-popover.component';

// Group preview modal component (new)
import { GroupPreviewModalComponent } from '../../components/group-preview-modal/group-preview-modal.component';

@Component({
  selector: 'app-community-detail',
  templateUrl: './community-detail.page.html',
  styleUrls: ['./community-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CommunityDetailPage implements OnInit {
  communityId: string | null = null;
  community: any = null;
  announcementGroup: any = null;
  groupsIn: any[] = [];
  groupsAvailable: any[] = [];
  loading = false;

  memberCount = 0;
  groupCount = 0;

  currentUserId: string = '';
  currentUserName: string = '';
  currentUserPhone: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseChatService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // prefer authService, fallback localStorage (safe)
    this.currentUserId = (this.authService?.authData?.userId) ? String(this.authService.authData.userId) : (localStorage.getItem('userId') || '');
    this.currentUserName = (this.authService?.authData?.name) ? String(this.authService.authData.name) : (localStorage.getItem('name') || '');
    this.currentUserPhone = (this.authService?.authData?.phone_number) ? String(this.authService.authData.phone_number) : (localStorage.getItem('phone') || '');

    this.route.queryParams.subscribe(params => {
      const cid = params['communityId'] || params['id'];
      if (!cid) return;
      this.communityId = cid;
      this.loadCommunityDetail();
    });
  }

  async loadCommunityDetail() {
    if (!this.communityId) return;
    this.loading = true;
    try {
      const commSnap = await get(ref(this.firebaseService['db'] as Database, `communities/${this.communityId}`));
      if (!commSnap.exists()) {
        this.community = null;
        this.memberCount = 0;
        this.groupCount = 0;
        this.loading = false;
        return;
      }
      this.community = commSnap.val();

      this.memberCount = this.community.membersCount ?? (this.community.members ? Object.keys(this.community.members).length : 0);
      this.groupCount = this.community.groups ? Object.keys(this.community.groups).length : 0;

      const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);

      this.announcementGroup = null;
      this.groupsIn = [];
      this.groupsAvailable = [];

      for (const gid of groupIds) {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g) continue;

        const groupObj = {
          id: gid,
          name: g.name || 'Unnamed group',
          type: g.type || 'normal',
          lastMessage: g.lastMessage || null,
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
          rawMembers: g.members || null,
          createdBy: g.createdBy || g.created_by || '',
          createdByName: g.createdByName || g.created_by_name || g.createdByName // best-effort
        };

        let isMember = false;
        try {
          if (!this.currentUserId) isMember = false;
          else if (groupObj.rawMembers) isMember = Object.prototype.hasOwnProperty.call(groupObj.rawMembers, this.currentUserId);
          else isMember = false;
        } catch {
          isMember = false;
        }

        if (groupObj.type === 'announcement' && !this.announcementGroup) {
          this.announcementGroup = groupObj;
        } else {
          if (isMember) this.groupsIn.push(groupObj);
          else this.groupsAvailable.push(groupObj);
        }
      }

      // Ensure "General" is near top
      this.groupsIn.sort((a, b) => {
        if (a.name === 'General') return -1;
        if (b.name === 'General') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      this.groupsAvailable.sort((a, b) => {
        if (a.name === 'General') return -1;
        if (b.name === 'General') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (err) {
      console.error('loadCommunityDetail error', err);
    } finally {
      this.loading = false;
    }
  }

  goToaddgroupcommunity() {
    this.router.navigate(['/add-group-community'], {
      queryParams: { communityId: this.communityId }
    });
  }

  /**
   * Open preview as a bottom-sheet style Ionic modal (half-screen with breakpoints).
   * This replaces the navigation-to-userabout style and shows the modal inside this page.
   */
  async openGroupPreview(group: any) {
    if (!group) return;

    // const modal = await this.modalCtrl.create({
    //   component: GroupPreviewModalComponent,
    //   componentProps: {
    //     group,
    //     communityName: this.community?.name || '',
    //     currentUserId: this.currentUserId,
    //     currentUserName: this.currentUserName,
    //     currentUserPhone: this.currentUserPhone
    //   },
    //   cssClass: 'group-preview-modal-wrapper', // custom class to style modal container
    //   // Ionic modal breakpoints (Ionic 6+)
    //   breakpoints: [0, 0.45, 0.9],
    //   initialBreakpoint: 0.45,
    //   swipeToClose: true,
    //   backdropDismiss: true
    // });

  const modal = await this.modalCtrl.create({
  component: GroupPreviewModalComponent,
  componentProps: {
    group,
    communityName: this.community?.name || '',
    currentUserId: this.currentUserId,
    currentUserName: this.currentUserName,
    currentUserPhone: this.currentUserPhone
  },
  cssClass: 'group-preview-modal-wrapper',
  breakpoints: [0, 0.45, 0.9],
  initialBreakpoint: 0.45,
  backdropDismiss: true
});



    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data && data.action === 'join' && data.groupId) {
      await this.joinGroup(data.groupId);
    }
  }

  async joinGroup(groupId: string) {
    if (!this.currentUserId) {
      const t = await this.toastCtrl.create({ message: 'Please login to join group', duration: 1800, color: 'danger' });
      await t.present();
      return;
    }

    try {
      const db = getDatabase();
      const groupSnap = await get(ref(db, `groups/${groupId}`));
      if (!groupSnap.exists()) {
        const t = await this.toastCtrl.create({ message: 'Group not found', duration: 1800, color: 'danger' });
        await t.present();
        return;
      }
      const groupData = groupSnap.val();

      if (groupData.members && Object.prototype.hasOwnProperty.call(groupData.members, this.currentUserId)) {
        const t = await this.toastCtrl.create({ message: 'You are already a member', duration: 1400, color: 'medium' });
        await t.present();
        return;
      }

      const now = Date.now();
      const memberDetails = {
        name: this.currentUserName || '',
        phone_number: this.currentUserPhone || '',
        role: 'member',
        status: 'active',
        joinedAt: now
      };

      const updates: any = {};
      updates[`/groups/${groupId}/members/${this.currentUserId}`] = memberDetails;
      const existingCount = groupData.membersCount || (groupData.members ? Object.keys(groupData.members).length : 0);
      updates[`/groups/${groupId}/membersCount`] = (existingCount + 1);
      updates[`/users/${this.currentUserId}/joinedGroups/${groupId}`] = true;

      await update(ref(db), updates);

      const idx = this.groupsAvailable.findIndex(g => g.id === groupId);
      if (idx > -1) {
        const g = this.groupsAvailable.splice(idx, 1)[0];
        g.membersCount = (existingCount + 1);
        g.rawMembers = g.rawMembers || {};
        g.rawMembers[this.currentUserId] = memberDetails;
        this.groupsIn.unshift(g);
      } else {
        await this.loadCommunityDetail();
      }

      const t = await this.toastCtrl.create({ message: `Joined ${groupData.name || 'group'}`, duration: 1600, color: 'success' });
      await t.present();
    } catch (err) {
      console.error('joinGroup error', err);
      const t = await this.toastCtrl.create({ message: 'Failed to join group', duration: 1800, color: 'danger' });
      await t.present();
    }
  }

  openGroupChat(groupId: string, groupName?: string) {
    const isMember = this.groupsIn.some(g => g.id === groupId) || (this.announcementGroup && this.announcementGroup.id === groupId);
    if (!isMember) {
      const grp = this.groupsAvailable.find(g => g.id === groupId) || { id: groupId, name: groupName };
      this.openGroupPreview(grp);
      return;
    }

    this.router.navigate(['/community-chat'], {
      queryParams: {
        receiverId: groupId,
        isGroup: true,
        communityId: this.communityId
      }
    });
  }

  back() {
    this.navCtrl.back();
  }

  async presentPopover(ev: any) {
    const pop = await this.popoverCtrl.create({
      component: CommunityMenuPopoverComponent,
      event: ev,
      translucent: true
    });

    await pop.present();

    const { data } = await pop.onDidDismiss();
    if (!data || !data.action) return;

    const action: string = data.action;
    switch (action) {
      case 'info':
        this.router.navigate(['/community-info'], { queryParams: { communityId: this.communityId } });
        break;
      case 'invite':
        this.router.navigate(['/invite-members'], { queryParams: { communityId: this.communityId } });
        break;
      case 'settings':
        this.router.navigate(['/community-settings'], { queryParams: { communityId: this.communityId } });
        break;
      default:
        break;
    }
  }
}
