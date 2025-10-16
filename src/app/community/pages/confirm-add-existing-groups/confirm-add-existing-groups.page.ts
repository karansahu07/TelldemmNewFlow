import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-confirm-add-existing-groups',
  templateUrl: './confirm-add-existing-groups.page.html',
  styleUrls: ['./confirm-add-existing-groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConfirmAddExistingGroupsPage implements OnInit {
  communityId: string | null = null;
  communityName: string | null = null; // <-- added property
  userId: string | null = null;

  // groups: array of { id, name, dp, visibility, permissionsSummary, membersCount, raw }
  groups: any[] = [];

  loading = false;
  adding = false;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService,
    private api : ApiService
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;

    // Prefer navigation extras state (when navigating with router.navigate([...], { state: {...} }))
    const navState: any = this.router.getCurrentNavigation()?.extras?.state;
    const histState: any = window.history.state;

    // read community info & groups from navigation state OR history state fallback
    this.communityId = navState?.communityId || histState?.communityId || null;
    this.communityName = navState?.communityName || histState?.communityName || null;

    // groups may be passed as `groups` array (preferred) or `selected` fallback
    this.groups = navState?.groups || histState?.groups || navState?.selected || histState?.selected || [];

    if (!this.groups || this.groups.length === 0) {
      console.warn('⚠️ No groups passed to confirm page');
    }
  }


async addToCommunity() {
  if (!this.communityId) {
    const t = await this.toastCtrl.create({
      message: 'Community id missing',
      duration: 2000,
      color: 'danger'
    });
    await t.present();
    return;
  }

  const ids = this.groups.map(g => g.id).filter(Boolean);
  if (!ids.length) {
    const t = await this.toastCtrl.create({
      message: 'No groups to add',
      duration: 1500
    });
    await t.present();
    return;
  }

  this.adding = true;

  try {
    const updates: any = {};
    const newMemberIds = new Set<string>();

    // 1) Link groups into community and collect members from each selected group
    // for (const gid of ids) {
    //   updates[`/communities/${this.communityId}/groups/${gid}`] = true;
    //   updates[`/groups/${gid}/communityId`] = this.communityId;

    //   try {
    //     const g = await this.firebaseService.getGroupInfo(gid);
    //     if (g && g.members) {
    //       Object.keys(g.members).forEach(mid => {
    //         if (mid) newMemberIds.add(mid);
    //       });
    //     }
    //   } catch (err) {
    //     console.warn('Failed to load group members for', gid, err);
    //   }
    // }

//     for (const gid of ids) {
//   // Link in Firebase
//   updates[`/communities/${this.communityId}/groups/${gid}`] = true;
//   updates[`/groups/${gid}/communityId`] = this.communityId;

//   try {
//     // Load full group from Firebase to read backendGroupId + members
//     const g: any = await this.firebaseService.getGroupInfo(gid);

//     // ✅ pick backendGroupId for API
//     const backendGroupId = g?.backendGroupId ?? g?.backend_group_id ?? null;
//     if (backendGroupId == null) {
//       console.warn(`No backendGroupId for group ${gid}; skipping backend add`);
//     } else {
//       // requester_id = current user
//       const requesterIdNum = Number(this.userId);
//       // communityId might be string; API accepts number|string
//       await firstValueFrom(
        
//         this.api.addGroupToCommunity(this.communityId as string, String(backendGroupId), requesterIdNum)
//       );
//     }

//     // collect members
//     if (g && g.members) {
//       Object.keys(g.members).forEach(mid => {
//         if (mid) newMemberIds.add(mid);
//       });
//     }
//   } catch (err) {
//     console.warn('Failed while processing group', gid, err);
//   }
// }


let backendCommunityId: string | null = null;
try {
  const res = await firstValueFrom(
    this.api.getCommunityById(this.communityId as string) // uses Firebase community id in URL
  );

  backendCommunityId = res?.community?.community_id != null? String(res.community.community_id) : null;

  if (!backendCommunityId) {
    console.warn('No backendCommunityId from getCommunityById response:', res);
  }
} catch (e) {
  console.warn('getCommunityById failed:', e);
}

for (const gid of ids) {
  updates[`/communities/${this.communityId}/groups/${gid}`] = true;
  updates[`/groups/${gid}/communityId`] = this.communityId;

  try {
    const g: any = await this.firebaseService.getGroupInfo(gid);

    const backendGroupId = g?.backendGroupId ?? g?.backend_group_id ?? null;
    if (backendGroupId == null) {
      console.warn(`No backendGroupId for group ${gid}; skipping backend add`);
    } else if (!backendCommunityId) {
      console.warn(`No backendCommunityId resolved; skipping backend add for group ${gid}`);
    } else {
      const requesterIdNum = Number(this.userId) || 0;

      // ✅ Your API signature:
      // addGroupToCommunity(community_id, group_id, requester_id)
      await firstValueFrom(
        this.api.addGroupToCommunity(
          backendCommunityId,
          String(backendGroupId),     
          requesterIdNum           
        )
      );
    }

    // collect members
    if (g?.members) {
      Object.keys(g.members).forEach(mid => mid && newMemberIds.add(mid));
    }
  } catch (err) {
    console.warn('Failed while processing group', gid, err);
  }
}

    

// 2) Fetch existing community members (so we don't remove them and compute accurate count)
    let existingMembersObj: any = {};
    try {
      const comm = await this.firebaseService.getCommunityInfo(this.communityId);
      existingMembersObj = comm?.members || {};
      Object.keys(existingMembersObj).forEach(k => newMemberIds.add(k));
    } catch (err) {
      console.warn('Failed to load existing community members', err);
    }

    // 3) Add every deduped member into community node + usersInCommunity index
    newMemberIds.forEach(uid => {
      updates[`/communities/${this.communityId}/members/${uid}`] = true;
      updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
    });

    // 4) Update community membersCount
    updates[`/communities/${this.communityId}/membersCount`] = newMemberIds.size;

    // 5) Find the community's announcement group (if any) and add members there too
    //    - we will attempt to find a group under community.groups with type === 'announcement'
    let announcementGroupId: string | null = null;
    try {
      const comm = await this.firebaseService.getCommunityInfo(this.communityId);
      const commGroups = comm?.groups || {};
      const groupIdsInComm = Object.keys(commGroups || {});

      for (const gid of groupIdsInComm) {
        try {
          const gInfo = await this.firebaseService.getGroupInfo(gid);
          if (gInfo && (gInfo.type === 'announcement' || gInfo.type === 'Announcements' || gInfo.name === 'Announcements')) {
            announcementGroupId = gid;
            break;
          }
        } catch (err) {
          // ignore single-group failure
        }
      }
    } catch (err) {
      console.warn('Failed to read community groups while locating announcement group', err);
    }

    if (announcementGroupId) {
      // fetch existing members of announcement group so we can compute new size
      let existingAnnMembers: Record<string, any> = {};
      try {
        const annInfo = await this.firebaseService.getGroupInfo(announcementGroupId);
        existingAnnMembers = annInfo?.members || {};
      } catch (err) {
        console.warn('Failed to load announcement group info', announcementGroupId, err);
      }

      // add all newMemberIds into announcement group members + users index for that group
      const annMemberSet = new Set<string>(Object.keys(existingAnnMembers || {}));
      newMemberIds.forEach(uid => {
        updates[`/groups/${announcementGroupId}/members/${uid}`] = true;
        updates[`/users/${uid}/groups/${announcementGroupId}`] = true;
        annMemberSet.add(uid);
      });

      // update announcement group's membersCount
      updates[`/groups/${announcementGroupId}/membersCount`] = annMemberSet.size;
    }

    // 6) Commit all updates atomically (preferred: bulkUpdate)
    if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
      await (this.firebaseService as any).bulkUpdate(updates);
    } else if (typeof (this.firebaseService as any).setPath === 'function') {
      const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
      await Promise.all(promises);
    } else {
      throw new Error('bulkUpdate or setPath not found on FirebaseChatService. Add helper to perform atomic update.');
    }

    const toast = await this.toastCtrl.create({
      message: 'Groups and members added to community (announcement group updated)',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    this.navCtrl.navigateBack('/community-detail');
  } catch (err: any) {
    console.error('addToCommunity failed', err);
    const msg = err && (err.message || err.code) ? (err.message || err.code) : String(err);
    const t = await this.toastCtrl.create({
      message: `Failed to add groups: ${msg}`,
      duration: 4000,
      color: 'danger'
    });
    await t.present();
  } finally {
    this.adding = false;
  }
}

}
