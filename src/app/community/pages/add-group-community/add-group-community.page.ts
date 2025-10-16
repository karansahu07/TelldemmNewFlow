import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-group-community',
  templateUrl: './add-group-community.page.html',
  styleUrls: ['./add-group-community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,TranslateModule]
})
export class AddGroupCommunityPage implements OnInit {
  communityId: string | null = null;
  communityName = '';
  groupsInCommunity: Array<{ id: string; name: string; type?: string; membersCount?: number }> = [];
  loading = false;
  // toastCtrl: any;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseChatService,
    private navCtrl: NavController,
    private toastCtrl : ToastController,
    private alertCtrl: AlertController, private translate: TranslateService
  ) {}

 ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cid = params['communityId'] || params['id'];
      if (cid) {
        this.communityId = cid;
        this.loadGroupsForCommunity();
      }
    });
  }

  goToCreateNewGroup() {
    this.navCtrl.navigateForward(['/create-new-group'], {
      queryParams: { communityId: this.communityId, communityName: this.communityName }
    });
  }

 async loadGroupsForCommunity() {
    if (!this.communityId) return;
    this.loading = true;
    this.groupsInCommunity = [];

    try {
      const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);
      if (!groupIds || groupIds.length === 0) return;

      for (const gid of groupIds) {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g) continue;
        this.groupsInCommunity.push({
          id: gid,
          name: g.name || this.translate.instant('community.manageGroups.unnamedGroup'), // 👈 localized fallback
          type: g.type || 'normal',
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
        });
      }
    } catch (err) {
      console.error('loadGroupsForCommunity error', err);
    } finally {
      this.loading = false;
    }
  }



async removeGroupFromCommunity(groupId: string) {
 if (!this.communityId || !groupId) return;

    const t = this.translate;

    // confirmation
    const alert = await this.alertCtrl.create({
      header: t.instant('community.manageGroups.remove.header'),
      message: t.instant('community.manageGroups.remove.message'),
      inputs: [
        {
          name: 'removeMembers',
          type: 'checkbox',
          label: t.instant('community.manageGroups.remove.alsoRemoveMembers'),
          value: 'removeMembers',
          checked: false
        }
      ],
      buttons: [
        { text: t.instant('community.actions.cancel'), role: 'cancel' },
        { text: t.instant('community.manageGroups.remove.cta'), role: 'ok' }
      ]
    });
    await alert.present();

    const res = await alert.onDidDismiss();
    if (res.role === 'cancel') return;

  // normalize checkbox value
    let checked = false;
    try {
      const data: any = res?.data;
      checked =
        Array.isArray(data?.values) ? data.values.includes('removeMembers') :
        Array.isArray(data?.data)   ? data.data.includes('removeMembers')   :
        Array.isArray(data)         ? data.includes('removeMembers')        :
        !!data?.removeMembers;
    } catch { checked = false; }

    this.loading = true;

  try {
    const updates: any = {};

    // unlink group from community and clear group's communityId
    updates[`/communities/${this.communityId}/groups/${groupId}`] = null;
    updates[`/groups/${groupId}/communityId`] = null;

    // fetch community info to know creator (so we don't remove them)
    let commInfo: any = null;
    try {
      commInfo = await this.firebaseService.getCommunityInfo(this.communityId);
    } catch (err) {
      console.warn('Failed to fetch community info', err);
    }
    const commCreatedBy = commInfo?.createdBy ?? null;

    // current groups under community and remaining after removal
    const currentGroupIds: string[] = await this.firebaseService.getGroupsInCommunity(this.communityId) || [];
    const remainingGroupIds = currentGroupIds.filter(gid => gid !== groupId);

    // members that remain because they are in remaining groups
    const remainingMembersFromGroups = new Set<string>();
    for (const gid of remainingGroupIds) {
      try {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (g && g.members) {
          Object.keys(g.members).forEach(uid => { if (uid) remainingMembersFromGroups.add(uid); });
        }
      } catch (err) {
        console.warn('Failed to load group members for', gid, err);
      }
    }

    // members of the group being removed
    const removedGroupMembers = new Set<string>();
    let removedGroupCurrentCount = 0;
    let removedGroupMembersObj: Record<string, any> = {};
    try {
      const removedGroup = await this.firebaseService.getGroupInfo(groupId);
      if (removedGroup) {
        removedGroupMembersObj = removedGroup.members || {};
        Object.keys(removedGroupMembersObj).forEach(uid => { if (uid) removedGroupMembers.add(uid); });
        removedGroupCurrentCount = removedGroup.membersCount || Object.keys(removedGroupMembersObj || {}).length || 0;
      }
    } catch (err) {
      console.warn('Failed to load removed group members', err);
    }

    // existing community members
    let existingCommMembersObj: Record<string, any> = {};
    try {
      const comm = commInfo ?? await this.firebaseService.getCommunityInfo(this.communityId);
      existingCommMembersObj = comm?.members || {};
    } catch (err) {
      console.warn('Failed to load community info', err);
    }

    // compute final members set depending on checkbox choice
    const finalMembersSet = new Set<string>();

    if (checked) {
      // user wants to remove members of the removed group from community as well
      // start with members that remain due to other groups
      remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
      // remove any removedGroupMembers from final set (force-remove)
      removedGroupMembers.forEach(uid => {
        if (finalMembersSet.has(uid)) finalMembersSet.delete(uid);
      });
      // Ensure community creator always stays in final set
      if (commCreatedBy) finalMembersSet.add(commCreatedBy);
    } else {
      // safe: union of existing community members and members present in remaining groups
      Object.keys(existingCommMembersObj || {}).forEach(uid => { if (uid) finalMembersSet.add(uid); });
      remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
      // ensure community creator present
      if (commCreatedBy) finalMembersSet.add(commCreatedBy);
    }

    // Build updates to set true for finalMembersSet and null for members no longer present
    const existingMemberIds = Object.keys(existingCommMembersObj || {});

    finalMembersSet.forEach(uid => {
      // never remove community creator - set true always
      updates[`/communities/${this.communityId}/members/${uid}`] = true;
      updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
    });

    existingMemberIds.forEach(uid => {
      if (!finalMembersSet.has(uid)) {
        // do not remove community creator
        if (uid === commCreatedBy) return;
        updates[`/communities/${this.communityId}/members/${uid}`] = null;
        updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = null;
      }
    });

    // update membersCount to final set size
    updates[`/communities/${this.communityId}/membersCount`] = finalMembersSet.size;

    // --- NEW: if checkbox checked, also remove those members from the group's members node and adjust group's membersCount ---
    if (checked) {
      // which uids were removed from community (excluding creator)
      const removedFromCommunitySet = new Set<string>();
      existingMemberIds.forEach(uid => {
        if (!finalMembersSet.has(uid) && uid !== commCreatedBy) removedFromCommunitySet.add(uid);
      });

      // members to delete from the specific group's members node = intersection(removedGroupMembers, removedFromCommunitySet)
      const toRemoveFromGroup: string[] = [];
      removedGroupMembers.forEach(uid => {
        if (removedFromCommunitySet.has(uid) && uid !== commCreatedBy) toRemoveFromGroup.push(uid);
      });

      // mark each group member entry for deletion & remove user's group index
      // toRemoveFromGroup.forEach(uid => {
      //   // updates[`/groups/${groupId}/members/${uid}`] = null;
      //   updates[`/users/${uid}/groups/${groupId}`] = null;
      //   // updates[`/groups/`]
      // });

      // --- find announcement group id for this community (if any) ---
let announcementGroupId: string | null = null;
try {
  const groupIdsInCommunity = await this.firebaseService.getGroupsInCommunity(this.communityId);
  if (Array.isArray(groupIdsInCommunity)) {
    for (const gid of groupIdsInCommunity) {
      try {
        const ginfo = await this.firebaseService.getGroupInfo(gid);
        if (ginfo && ginfo.type === 'announcement') {
          announcementGroupId = gid;
          break;
        }
      } catch (e) {
        console.warn('Failed to load group info while searching announcement group', gid, e);
      }
    }
  }
} catch (e) {
  console.warn('Failed to fetch groups for community to find announcement group', e);
}

// --- Determine which members must be removed from the specific group (toRemoveFromGroup computed earlier) ---
// (Assume toRemoveFromGroup: string[] already computed)
toRemoveFromGroup.forEach(uid => {
  // 1) remove user from this group's members node
  // updates[`/groups/${groupId}/members/${uid}`] = null;

  // 2) remove user's index for this group
  updates[`/users/${uid}/groups/${groupId}`] = null;

  // 3) Also remove from announcement group (if announcementGroupId exists)
  if (announcementGroupId) {
    updates[`/groups/${announcementGroupId}/members/${uid}`] = null;
    updates[`/users/${uid}/groups/${announcementGroupId}`] = null;
  }
});

// --- adjust announcement group's membersCount if we removed people from it ---
if (announcementGroupId && toRemoveFromGroup.length > 0) {
  try {
    const annInfo = await this.firebaseService.getGroupInfo(announcementGroupId);
    const annCurrentCount = annInfo?.membersCount || (annInfo?.members ? Object.keys(annInfo.members).length : 0);
    // compute how many of `toRemoveFromGroup` were actually present in announcement group
    let actuallyRemovedFromAnn = 0;
    if (annInfo && annInfo.members) {
      for (const uid of toRemoveFromGroup) {
        if (annInfo.members[uid]) actuallyRemovedFromAnn++;
      }
    } else {
      // fallback: assume all removed from group might have been in announcement group
      actuallyRemovedFromAnn = toRemoveFromGroup.length;
    }
    const newAnnCount = Math.max(0, annCurrentCount - actuallyRemovedFromAnn);
    updates[`/groups/${announcementGroupId}/membersCount`] = newAnnCount;
  } catch (e) {
    console.warn('Failed to update announcement group count', e);
  }
}
      // adjust group's membersCount (subtract removedFromGroup count, ensure >= 0)
      const decrement = toRemoveFromGroup.length;
      const newGroupCount = Math.max(0, (removedGroupCurrentCount || 0) - decrement);
      // updates[`/groups/${groupId}/membersCount`] = newGroupCount;
    }

    if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
        await (this.firebaseService as any).bulkUpdate(updates);
      } else if (typeof (this.firebaseService as any).setPath === 'function') {
        const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
        await Promise.all(promises);
      } else {
        throw new Error('bulkUpdate or setPath helper not found on FirebaseChatService');
      }

    const successToast = await this.toastCtrl.create({
        message: t.instant('community.manageGroups.toasts.removed'),
        duration: 2000,
        color: 'success'
      });
      await successToast.present();

      await this.loadGroupsForCommunity();
  } catch (err) {
    console.error('removeGroupFromCommunity failed', err);
      const errToast = await this.toastCtrl.create({
        message: t.instant('community.manageGroups.toasts.removeFailed'),
        duration: 3000,
        color: 'danger'
      });
      await errToast.present();
    } finally {
      this.loading = false;
    }
}





 goToAddExistingGroups() {
    this.navCtrl.navigateForward(['/add-existing-groups'], {
      queryParams: { communityId: this.route.snapshot.queryParamMap.get('communityId') }
    });
  }
}
