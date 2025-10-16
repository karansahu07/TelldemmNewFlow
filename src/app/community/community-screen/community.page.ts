import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  IonicModule,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { MenuPopoverComponent } from '../../components/menu-popover/menu-popover.component';
import { FooterTabsComponent } from '../../components/footer-tabs/footer-tabs.component';
 import { FirebaseChatService } from '../../services/firebase-chat.service';
import { AuthService } from '../../auth/auth.service';
import { Database, get, ref } from 'firebase/database';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent,TranslateModule],
})
export class CommunityPage implements OnInit {
//  userId = localStorage.getItem('userId') || '';
  userId = this.authService.authData?.userId as string;
  joinedCommunities: any[] = [];
  selectedCommunity: any = null;
  communityGroups: any[] = [];

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private firebaseService: FirebaseChatService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private translate: TranslateService 
  ) {}

  ngOnInit() {
    this.loadUserCommunities();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  // async loadUserCommunities() {
  //   this.joinedCommunities = [];
  //   const communityIds = await this.firebaseService.getUserCommunities(this.userId);

  //   for (const id of communityIds) {
  //     const snapshot = await this.firebaseService.getGroupInfo(id);
  //     this.joinedCommunities.push({
  //       id,
  //       name: snapshot?.name || 'Unnamed Community',
  //       icon: 'assets/images/user.jfif',
  //     });
  //   }
  // }

 async loadUserCommunities() {
  this.joinedCommunities = [];
  const communityIds = await this.firebaseService.getUserCommunities(this.userId);

  for (const cid of communityIds) {
    const commSnap = await get(ref(this.firebaseService['db'] as Database, `communities/${cid}`));
    if (!commSnap.exists()) continue;
    const commData = commSnap.val();

    const groupIds = await this.firebaseService.getGroupsInCommunity(cid);
    const groups: any[] = [];
    for (const gid of groupIds) {
      const gData = await this.firebaseService.getGroupInfo(gid);
      if (gData) {
        groups.push({
          id: gid,
          name: gData.name,
          type: gData.type || 'normal',
        });
      }
    }

    this.joinedCommunities.push({
      id: cid,
      name: commData.name || this.translate.instant('community.unnamedCommunity'),
      icon: commData.icon || 'assets/images/user.jfif',
      groups
    });
  }
}


  // async createCommunityPrompt() {
  //   const alert = await this.alertCtrl.create({
  //     header: 'New Community',
  //     inputs: [
  //       { name: 'name', type: 'text', placeholder: 'Community Name' },
  //       { name: 'description', type: 'text', placeholder: 'Community Description' },
  //     ],
  //     buttons: [
  //       { text: 'Cancel', role: 'cancel' },
  //       {
  //         text: 'Create',
  //         handler: async (data) => {
  //           if (data.name) {
  //             const communityId = 'community_' + Date.now();
  //             await this.firebaseService.createCommunity(
  //               communityId,
  //               data.name,
  //               data.description,
  //               this.userId
  //             );
  //             await this.firebaseService.addUserToCommunity(this.userId, communityId);

  //             // Create announcement group automatically
  //             const groupId = 'group_' + Date.now();
  //             await this.firebaseService.createGroup(
  //               groupId,
  //               'Announcements',
  //               [this.userId],
  //               communityId,
  //               // true
  //             );

  //             this.loadUserCommunities();

  //             const toast = await this.toastCtrl.create({
  //               message: 'Community created successfully',
  //               duration: 2000,
  //               color: 'success',
  //             });
  //             toast.present();
  //           }
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }

  async createCommunityPrompt() {
  // instead of showing a popup, redirect to new page
  this.router.navigate(['/new-community']);
}

  async openCommunityGroups(community: any) {
    this.selectedCommunity = community;
    this.communityGroups = [];

    const groupIds = await this.firebaseService.getGroupsInCommunity(community.id);
    for (const gid of groupIds) {
      const groupData = await this.firebaseService.getGroupInfo(gid);
      if (groupData) {
        this.communityGroups.push({
          id: gid,
          name: groupData.name,
          type: groupData.type,
        });
      }
    }
  }

 async createGroupInCommunityPrompt() {
  const t = this.translate;
  const alert = await this.alertCtrl.create({
    header: t.instant('community.newGroup.header'),
    inputs: [
      { name: 'name', type: 'text', placeholder: t.instant('community.newGroup.placeholder') },
      { name: 'type', type: 'radio', label: t.instant('community.groupType.normal'), value: 'normal', checked: true },
      { name: 'type', type: 'radio', label: t.instant('community.groupType.announcement'), value: 'announcement' },
    ],
    buttons: [
      { text: t.instant('community.actions.cancel'), role: 'cancel' },
      {
        text: t.instant('community.newGroup.create'),
        handler: async (data) => {
          if (!data?.name || !this.selectedCommunity) return;
          const groupId = 'group_' + Date.now();
          // await this.firebaseService.createGroup({groupId, groupName : data.name, this.selectedCommunity.id});
          this.openCommunityGroups(this.selectedCommunity);
          const toast = await this.toastCtrl.create({
            message: t.instant('community.toasts.groupCreated'),
            duration: 2000,
            color: 'success',
          });
          toast.present();
        },
      },
    ],
  });
  await alert.present();
}

goToGroupChat(groupId: string) {
  this.router.navigate(['/chatting-screen'], {
    queryParams: {
      receiverId: groupId,
      isGroup: true
    }
  });
}


  goToAddGroupCommunity(community: any) {
  this.router.navigate(['/community-detail'], {
    queryParams: { communityId: community.id }
  });
}

}
