// import { CommonModule } from '@angular/common';
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { IonicModule, AlertController, PopoverController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { TranslateModule } from '@ngx-translate/core';

// import { getDatabase, ref as rtdbRef, onValue, off, get, remove } from 'firebase/database';
// import { AuthService } from '../../auth/auth.service';
// import { ApiService } from '../../services/api/api.service';
// import { FirebaseChatService } from '../../services/firebase-chat.service';
// import { EncryptionService } from '../../services/encryption.service';
// import { ArchItem } from 'src/types';
// import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service';

// @Component({
//   selector: 'app-archieved-screen',
//   standalone: true,
//   imports: [IonicModule, CommonModule, TranslateModule],
//   templateUrl: './archieved-screen.page.html',
//   styleUrls: ['./archieved-screen.page.scss']
// })
// export class ArchievedScreenPage implements OnInit, OnDestroy {
//   items: ArchItem[] = [];
//   isLoading = true;

//   // selection state
//   selected: ArchItem[] = [];
//   private longPressTimer: any = null;

//   private userId = '';
//   private unsubArchive?: () => void;

//   constructor(
//     private auth: AuthService,
//     private api: ApiService,
//     private router: Router,
//     private alertCtrl: AlertController,
//     private popover: PopoverController,
//     private firebaseChat: FirebaseChatService,
//     private enc: EncryptionService,
//     private secureStorage: SecureStorageService
//   ) {}

//   async ngOnInit() {
//     this.userId = this.auth.authData?.userId?.toString() || '';
//     this.startArchiveListener();
//   }

//   ngOnDestroy() {
//     try { this.unsubArchive?.(); } catch {}
//   }

//   /** live list of archived rooms */
//   private startArchiveListener() {
//     const db = getDatabase();
//     const ref = rtdbRef(db, `archivedChats/${this.userId}`);
//     const cb = onValue(ref, async snap => {
//       const map = snap.exists() ? snap.val() : {};
//       const roomIds = Object.keys(map).filter(k => map[k]?.isArchived === true);

//       const items = await Promise.all(roomIds.map(rid => this.buildItem(rid)));
//       this.items = items.sort((a, b) => {
//         const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
//         const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
//         return tb - ta;
//       });
//       this.isLoading = false;
//     });

//     this.unsubArchive = () => off(ref, 'value', cb);
//   }

//   /** construct one row (name, avatar, preview, unread) */
//   private async buildItem(roomId: string): Promise<ArchItem> {
//     const isGroup = roomId.startsWith('group_');
//     let name = 'Chat';
//     let avatar: string | null = null;
//     let otherUserId: string | undefined;

//     if (isGroup) {
//       const g = await this.firebaseChat.getGroupInfo(roomId);
//       name = g?.name || 'Group';
//       avatar = null;
//       try {
//         const res: any = await new Promise(resolve =>
//           this.api.getGroupDp(roomId).subscribe(resolve, () => resolve(null))
//         );
//         if (res?.group_dp_url) avatar = res.group_dp_url;
//       } catch {}
//     } else {
//       // private: resolve "other" id from a_b
//       const [a, b] = roomId.split('_');
//       otherUserId = a === this.userId ? b : a;

//       const user = await this.fetchUser(otherUserId);
//       name = user?.name || otherUserId || 'User';
//       avatar = user?.profile_picture_url || null;
//     }

//     // last message preview
//     const { preview, time, ts } = await this.fetchPreview(roomId);

//     // unread count — use service if available else fallback
//     let unread = 0;
//     try {
//       const fn = (this.firebaseChat as any).getUnreadCountOnce;
//       unread = fn
//         ? await fn.call(this.firebaseChat, roomId, this.userId)
//         : await this.fetchUnreadCount(roomId);
//     } catch { unread = 0; }

//     return {
//       roomId,
//       isGroup,
//       otherUserId,
//       name,
//       avatar,
//       message: preview,
//       time,
//       timestamp: ts,
//       unreadCount: unread || 0
//     };
//   }

//   private async fetchUser(userId: string): Promise<any | null> {
//     return await new Promise(resolve => {
//       this.api.getAllUsers().subscribe({
//         next: (list: any[]) => resolve(list?.find(u => String(u.user_id) === String(userId)) || null),
//         error: () => resolve(null)
//       });
//     });
//   }

//   private async fetchUnreadCount(roomId: string): Promise<number> {
//     try {
//       const db = getDatabase();
//       const snap = await get(rtdbRef(db, `unreadCounts/${roomId}/${this.userId}`));
//       return snap.exists() ? snap.val() || 0 : 0;
//     } catch { return 0; }
//   }

//   private formatTimestamp(timestamp?: string): string {
//     if (!timestamp) return '';
//     const d = new Date(timestamp);
//     const now = new Date();
//     const yest = new Date(); yest.setDate(now.getDate() - 1);

//     if (d.toDateString() === now.toDateString()) {
//       return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
//     }
//     if (d.toDateString() === yest.toDateString()) return 'Yesterday';
//     if (d.getFullYear() === now.getFullYear()) {
//       return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
//     }
//     return d.toLocaleDateString();
//   }

//   private async fetchPreview(roomId: string): Promise<{ preview: string; time: string; ts?: string }> {
//     try {
//       const db = getDatabase();
//       const chatsSnap = await get(rtdbRef(db, `chats/${roomId}`));
//       const val = chatsSnap.val();
//       if (!val) return { preview: '', time: '' };

//       const msgs = Object.entries(val).map(([k, v]: any) => ({ key: k, ...(v as any) }));
//       for (let i = msgs.length - 1; i >= 0; i--) {
//         const m: any = msgs[i];
//         if (m.isDeleted || m.deletedForEveryone) continue;
//         if (m.deletedFor && this.userId && m.deletedFor[String(this.userId)]) continue;

//         if (m.attachment?.type && m.attachment.type !== 'text') {
//           const map: Record<string, string> = {
//             image: '📷 Photo',
//             video: '🎥 Video',
//             audio: '🎵 Audio',
//             file: '📎 File'
//           };
//           const txt = map[m.attachment?.type as string] || '[Media]';
//           return { preview: txt, time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
//         } else {
//           try {
//             const dec = await this.enc.decrypt(m.text || '');
//             const p = dec?.trim() ? dec : (m.text || '');
//             if (p) return { preview: p, time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
//           } catch {
//             return { preview: '[Encrypted]', time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
//           }
//         }
//       }
//       const last = msgs[msgs.length - 1];
//       return { preview: 'This message was deleted', time: this.formatTimestamp(last?.timestamp), ts: last?.timestamp };
//     } catch {
//       return { preview: '', time: '' };
//     }
//   }

//   /** open like home screen (exact parity) */
//   async open(item: ArchItem) {
//     const receiverId = item.roomId;
//     const receiver_name = item.name;

//     await this.secureStorage.setItem('receiver_name', receiver_name);

//     // Community (if you ever flag archived communities)
//     if ((item as any).isCommunity) {
//       this.router.navigate(['/community-detail'], { queryParams: { communityId: receiverId } });
//       return;
//     }

//     if (item.isGroup) {
//       this.router.navigate(['/chatting-screen'], { queryParams: { receiverId, isGroup: true } });
//     } else {
//       const receiver_phone = item.otherUserId!;
//       await this.secureStorage.setItem('receiver_phone', receiver_phone);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: receiver_phone, receiver_phone }
//       });
//     }
//   }

//   /* ---------- selection helpers ---------- */
//   get selectionMeta() {
//     const sel = this.selected || [];
//     const hasPriv = sel.some(s => !s.isGroup);
//     const hasGroup = sel.some(s => s.isGroup);
//     return {
//       count: sel.length,
//       onlyPrivates: hasPriv && !hasGroup,
//       onlyGroups: !hasPriv && hasGroup,
//       mixed: hasPriv && hasGroup
//     };
//   }

//   isSelected(it: ArchItem): boolean {
//     return this.selected.some(s => s.roomId === it.roomId);
//   }

//   toggleSelection(it: ArchItem, ev?: Event) {
//     if (ev) ev.stopPropagation();
//     const i = this.selected.findIndex(s => s.roomId === it.roomId);
//     if (i > -1) this.selected.splice(i, 1);
//     else this.selected.push(it);
//     if (this.selected.length === 0) this.cancelLongPress();
//   }

//   clearSelection() {
//     this.selected = [];
//     this.cancelLongPress();
//   }

//   onRowClick(it: ArchItem, ev: Event) {
//     if (this.selected.length > 0) { this.toggleSelection(it, ev); return; }
//     this.open(it);
//   }

//   startLongPress(it: ArchItem) {
//     this.cancelLongPress();
//     this.longPressTimer = setTimeout(() => {
//       if (!this.isSelected(it)) this.selected = [it];
//     }, 500);
//   }

//   cancelLongPress() {
//     if (this.longPressTimer) {
//       clearTimeout(this.longPressTimer);
//       this.longPressTimer = null;
//     }
//   }

//   /* ---------- header actions ---------- */

//   // bulk unarchive from header
//   async unarchiveSelected() {
//     const db = getDatabase();
//     const tasks = this.selected.map(it =>
//       remove(rtdbRef(db, `archivedChats/${this.userId}/${it.roomId}`)).catch(() => null)
//     );
//     await Promise.all(tasks);

//     // optimistic UI
//     const selectedIds = new Set(this.selected.map(s => s.roomId));
//     this.items = this.items.filter(i => !selectedIds.has(i.roomId));
//     this.clearSelection();
//   }

//   // delete for me — only privates
//   async deleteSelected() {
//     const db = getDatabase();
//     const privates = this.selected.filter(s => !s.isGroup);
//     if (privates.length === 0) { this.clearSelection(); return; }

//     await Promise.all(
//       privates.map(async it => {
//         try { await this.firebaseChat.deleteChatForUser(it.roomId, this.userId); } catch {}
//         try { await remove(rtdbRef(db, `archivedChats/${this.userId}/${it.roomId}`)); } catch {}
//       })
//     );

//     const toRemove = new Set(privates.map(p => p.roomId));
//     this.items = this.items.filter(it => !toRemove.has(it.roomId));
//     this.clearSelection();
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonicModule,
  AlertController,
  PopoverController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  getDatabase,
  ref as rtdbRef,
  onValue,
  off,
  get,
  remove,
  set,
} from 'firebase/database';
import { AuthService } from '../../auth/auth.service';
import { ApiService } from '../../services/api/api.service';
import { FirebaseChatService } from '../../services/firebase-chat.service';
import { EncryptionService } from '../../services/encryption.service';
import { ArchItem } from 'src/types';
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service';
import { ContactSyncService } from 'src/app/services/contact-sync.service'; // ✅ NEW
import { ArchieveMenuPopoverComponent } from 'src/app/components/archieve-menu-popover/archieve-menu-popover.component';
import { IConversation } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-archieved-screen',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  templateUrl: './archieved-screen.page.html',
  styleUrls: ['./archieved-screen.page.scss'],
})
export class ArchievedScreenPage implements OnInit, OnDestroy {
  items: IConversation[] = [];
  isLoading = true;

  // selection state
  selected: IConversation[] = [];
  private longPressTimer: any = null;

  private userId = '';
  private unsubArchive?: () => void;

  // ✅ device contacts map: phone(normalized) -> device name
  private deviceNameMap = new Map<string, string>();

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private popover: PopoverController,
    private firebaseChat: FirebaseChatService,
    private enc: EncryptionService,
    private secureStorage: SecureStorageService,
    private contactSync: ContactSyncService
  ) {}

  async ngOnInit() {
    this.userId = this.auth.authData?.userId?.toString() || '';
  }

  async ionViewWillEnter() {
    try {
      this.isLoading = true;
      this.firebaseChat.conversations.subscribe((conv) => {
        this.items = conv.filter((c) => c.isArchived);
      });
      this.isLoading = false;
    } catch (error) {
      console.error('Error in Archived', error);
    }
  }

  ngOnDestroy() {
    try {
      this.unsubArchive?.();
    } catch {}
  }

  private getMenuMode():
    | 'none'
    | 'single-private'
    | 'multi-private'
    | 'single-group'
    | 'multi-group'
    | 'mixed' {
    const sel = this.selected;
    if (!sel || sel.length === 0) return 'none';

    const hasPriv = sel.some((s) => s.type !== 'group');
    const hasGroup = sel.some((s) => s.type == 'group');

    if (hasPriv && hasGroup) return 'mixed';
    if (hasPriv) return sel.length === 1 ? 'single-private' : 'multi-private';
    if (hasGroup) return sel.length === 1 ? 'single-group' : 'multi-group';
    return 'none';
  }

  async openArchiveMenu(ev: Event) {
    const pop = await this.popover.create({
      component: ArchieveMenuPopoverComponent,
      componentProps: {
        mode: this.getMenuMode(),
        allSelected:
          this.selected.length > 0 &&
          this.selected.length === this.items.length,
        canLock: true,
      },
      event: ev,
      translucent: true,
    });
    await pop.present();

    const { data } = await pop.onDidDismiss();
    if (!data?.action) return;

    switch (data.action) {
      case 'settings':
        /* open archive settings */ break;

      case 'viewContact':
        await this.openSelectedContactProfile();
        break;
      case 'addShortcut':
        /* WIP */ break;
      case 'block':
        /* WIP */ break;

      case 'markUnread':
        /* mark selected unread */ break;
      case 'markRead':
        /* mark selected read */ break;

      case 'selectAll':
        this.selected = [...this.items];
        break;

      case 'lockChat':
        /* lock one */ break;
      case 'lockChats':
        /* lock many */ break;

      case 'favorite':
        /* add to favorites */ break;
      case 'addToList':
        /* add to list */ break;

      case 'exitGroup':
        await this.confirmAndExitSingleSelectedGroup();
        break;
      case 'exitGroups':
        await this.confirmAndExitMultipleSelectedGroups();
        break;
      case 'groupInfo':
        this.openSelectedGroupInfo();
        break;
    }
  }

  private async openSelectedContactProfile(): Promise<void> {
    const sel = this.selected.filter((s) => s.type !== 'group');
    const it = sel[0];
    // if (!it || !it.otherUserId) return;
    const parts = it.roomId?.split('_');
    const receiverId =
      parts.find((p) => p !== this.userId) ?? parts[parts.length - 1];

    const user = await this.fetchUser(receiverId);
    const phoneNorm = this.normalizePhone(user?.phone_number);

    const queryParams: any = {
      receiverId: String(receiverId),
      receiver_phone: phoneNorm || String(receiverId),
      receiver_name: it.title,
      isGroup: false,
    };

    this.router.navigate(['/profile-screen'], { queryParams });
    this.clearSelection();
  }

  private openSelectedGroupInfo(): void {
    const sel = this.selected.filter((s) => s.type == 'group');
    const it = sel[0];
    if (!it) return;

    const queryParams: any = {
      receiverId: it.roomId,
      receiver_phone: '',
      receiver_name: it.title,
      isGroup: true,
    };

    this.router.navigate(['/profile-screen'], { queryParams });
    this.clearSelection();
  }

  /** Exit ONE selected group (Archived screen) */
  private async confirmAndExitSingleSelectedGroup(): Promise<void> {
    const sel = this.selected.filter((s) => s.type == 'group');
    const it = sel[0];
    if (!it) return;

    const alert = await this.alertCtrl.create({
      header: 'Exit Group',
      message: `Are you sure you want to exit "${it.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Exit',
          handler: async () => {
            try {
              await this.exitGroup(it.roomId);

              // remove from archived node as well
              const db = getDatabase();
              try {
                await remove(
                  rtdbRef(db, `archivedChats/${this.userId}/${it.roomId}`)
                );
              } catch {}

              // remove row from UI
              this.items = this.items.filter((x) => x.roomId !== it.roomId);

              this.clearSelection();

              const done = await this.alertCtrl.create({
                header: 'Exited',
                message: 'You exited the group.',
                buttons: ['OK'],
              });
              await done.present();
            } catch (e) {
              console.warn('Exit group failed:', e);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  /** Exit MANY selected groups (Archived screen) */
  private async confirmAndExitMultipleSelectedGroups(): Promise<void> {
    const groups = this.selected.filter((s) => s.type == 'group');
    if (groups.length === 0) return;

    const alert = await this.alertCtrl.create({
      header: 'Exit Groups',
      message: `Exit ${groups.length} selected groups?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Exit',
          handler: async () => {
            let success = 0,
              fail = 0;
            const db = getDatabase();

            for (const g of groups) {
              try {
                await this.exitGroup(g.roomId);

                // clean archive entry for each
                try {
                  await remove(
                    rtdbRef(db, `archivedChats/${this.userId}/${g.roomId}`)
                  );
                } catch {}

                // remove from UI
                this.items = this.items.filter((x) => x.roomId !== g.roomId);
                success++;
              } catch (e) {
                console.warn('exit group failed:', g.roomId, e);
                fail++;
              }
            }

            this.clearSelection();

            const msg =
              fail === 0
                ? `Exited ${success} groups`
                : `Exited ${success} groups, ${fail} failed`;
            const done = await this.alertCtrl.create({
              header: 'Done',
              message: msg,
              buttons: ['OK'],
            });
            await done.present();
          },
        },
      ],
    });
    await alert.present();
  }

  /** Core: exit a group and reassign admin if needed */
  private async exitGroup(groupId: string): Promise<void> {
    const userId = this.userId;
    if (!groupId || !userId) throw new Error('Missing groupId/userId');

    const db = getDatabase();

    // read my member record
    const memberPath = `groups/${groupId}/members/${userId}`;
    const memberSnap = await get(rtdbRef(db, memberPath));
    if (!memberSnap.exists()) return; // already not a member

    const myMember = memberSnap.val();
    const wasAdmin = String(myMember?.role || '').toLowerCase() === 'admin';

    // move to pastmembers, then remove from members
    const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;
    const updatedMember = {
      ...myMember,
      status: 'inactive',
      removedAt: new Date().toISOString(),
    };

    await Promise.all([
      // add to pastmembers
      (async () => {
        try {
          await remove(rtdbRef(db, pastMemberPath));
        } catch {}
      })().then(() => set(rtdbRef(db, pastMemberPath), updatedMember)),
      // update/remove current member node
      (async () => {
        try {
          await remove(rtdbRef(db, memberPath));
        } catch {}
      })(),
    ]);

    // if I was admin, ensure at least one admin remains
    if (wasAdmin) {
      const membersSnap = await get(rtdbRef(db, `groups/${groupId}/members`));
      if (membersSnap.exists()) {
        const members = membersSnap.val() || {};
        const remainingIds: string[] = Object.keys(members).filter(
          (mid) => String(mid) !== String(userId)
        );

        if (remainingIds.length > 0) {
          const otherAdmins = remainingIds.filter(
            (mid) => String(members[mid]?.role || '').toLowerCase() === 'admin'
          );
          if (otherAdmins.length === 0) {
            const nonAdmins = remainingIds.filter(
              (mid) =>
                String(members[mid]?.role || '').toLowerCase() !== 'admin'
            );
            const pool = nonAdmins.length > 0 ? nonAdmins : remainingIds;
            const newAdminId = pool[Math.floor(Math.random() * pool.length)];
            try {
              await set(
                rtdbRef(db, `groups/${groupId}/members/${newAdminId}/role`),
                'admin'
              );
            } catch {}
          }
        }
      }
    }

    // optional: clear my unread count node
    try {
      await (this.firebaseChat as any).resetUnreadCount?.(groupId, userId);
    } catch {}
  }

  /** live list of archived rooms */
  private startArchiveListener() {
    // const db = getDatabase();
    // const ref = rtdbRef(db, `archivedChats/${this.userId}`);
    // const cb = onValue(ref, async (snap) => {
    //   const map = snap.exists() ? snap.val() : {};
    //   const roomIds = Object.keys(map).filter(
    //     (k) => map[k]?.isArchived === true
    //   );
    //   const items = await Promise.all(
    //     roomIds.map((rid) => this.buildItem(rid))
    //   );
    //   this.items = items.sort((a, b) => {
    //     const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    //     const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    //     return tb - ta;
    //   });
    //   this.isLoading = false;
    // });
    // this.unsubArchive = () => off(ref, 'value', cb);
  }

  /** construct one row (name, avatar, preview, unread) */
  private async buildItem(roomId: string): Promise<ArchItem> {
    const isGroup = roomId.startsWith('group_');
    let name = 'Chat';
    let avatar: string | null = null;
    let otherUserId: string | undefined;

    if (isGroup) {
      const g = await this.firebaseChat.getGroupInfo(roomId);
      name = g?.name || 'Group';
      avatar = null;
      try {
        const res: any = await new Promise((resolve) =>
          this.api.getGroupDp(roomId).subscribe(resolve, () => resolve(null))
        );
        if (res?.group_dp_url) avatar = res.group_dp_url;
      } catch {}
    } else {
      // private: resolve "other" id from a_b
      const [a, b] = roomId.split('_');
      otherUserId = a === this.userId ? b : a;

      const user = await this.fetchUser(otherUserId);

      // ✅ device-name preference like Home
      const phoneKey = this.normalizePhone(user?.phone_number);
      const deviceName = phoneKey
        ? this.deviceNameMap.get(phoneKey)
        : undefined;
      const phoneDisplay = phoneKey ? phoneKey.slice(-10) : undefined;

      name = deviceName || phoneDisplay || user?.name || otherUserId || 'User';

      avatar = user?.profile_picture_url || null;
    }

    // last message preview
    const { preview, time, ts } = await this.fetchPreview(roomId);

    // unread count — use service if available else fallback
    let unread = 0;
    try {
      const fn = (this.firebaseChat as any).getUnreadCountOnce;
      unread = fn
        ? await fn.call(this.firebaseChat, roomId, this.userId)
        : await this.fetchUnreadCount(roomId);
    } catch {
      unread = 0;
    }

    return {
      roomId,
      isGroup,
      otherUserId,
      name,
      avatar,
      message: preview,
      time,
      timestamp: ts,
      unreadCount: unread || 0,
    };
  }

  private async fetchUser(userId: string): Promise<any | null> {
    // same as before; we just need phone_number included from API
    return await new Promise((resolve) => {
      this.api.getAllUsers().subscribe({
        next: (list: any[]) =>
          resolve(
            list?.find((u) => String(u.user_id) === String(userId)) || null
          ),
        error: () => resolve(null),
      });
    });
  }

  private normalizePhone(num?: string): string {
    if (!num) return '';
    return String(num).replace(/\D/g, '').slice(-10);
  }

  private async fetchUnreadCount(roomId: string): Promise<number> {
    try {
      const db = getDatabase();
      const snap = await get(
        rtdbRef(db, `unreadCounts/${roomId}/${this.userId}`)
      );
      return snap.exists() ? snap.val() || 0 : 0;
    } catch {
      return 0;
    }
  }

  private formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const yest = new Date();
    yest.setDate(now.getDate() - 1);

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    return d.toLocaleDateString();
  }

  private async fetchPreview(
    roomId: string
  ): Promise<{ preview: string; time: string; ts?: string }> {
    try {
      const db = getDatabase();
      const chatsSnap = await get(rtdbRef(db, `chats/${roomId}`));
      const val = chatsSnap.val();
      if (!val) return { preview: '', time: '' };

      const msgs = Object.entries(val).map(([k, v]: any) => ({
        key: k,
        ...(v as any),
      }));
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m: any = msgs[i];
        if (m.isDeleted || m.deletedForEveryone) continue;
        if (m.deletedFor && this.userId && m.deletedFor[String(this.userId)])
          continue;

        if (m.attachment?.type && m.attachment.type !== 'text') {
          const map: Record<string, string> = {
            image: '📷 Photo',
            video: '🎥 Video',
            audio: '🎵 Audio',
            file: '📎 File',
          };
          const txt = map[m.attachment?.type as string] || '[Media]';
          return {
            preview: txt,
            time: this.formatTimestamp(m.timestamp),
            ts: m.timestamp,
          };
        } else {
          try {
            const dec = await this.enc.decrypt(m.text || '');
            const p = dec?.trim() ? dec : m.text || '';
            if (p)
              return {
                preview: p,
                time: this.formatTimestamp(m.timestamp),
                ts: m.timestamp,
              };
          } catch {
            return {
              preview: '[Encrypted]',
              time: this.formatTimestamp(m.timestamp),
              ts: m.timestamp,
            };
          }
        }
      }
      const last = msgs[msgs.length - 1];
      return {
        preview: 'This message was deleted',
        time: this.formatTimestamp(last?.timestamp),
        ts: last?.timestamp,
      };
    } catch {
      return { preview: '', time: '' };
    }
  }

  /** open like home screen (exact parity) */
  async open(item: IConversation) {
    const receiverId = item.roomId;
    const receiver_name = item.title;

    // await this.secureStorage.setItem('receiver_name', receiver_name);

    if ((item as any).isCommunity) {
      this.router.navigate(['/community-detail'], {
        queryParams: { communityId: receiverId },
      });
      return;
    }
    await this.firebaseChat.openChat(item); // Buggy area

    if (item.type == 'group') {
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId, isGroup: true },
      });
    } else {
      // const receiver_phone = item.otherUserId!;
      // await this.secureStorage.setItem('receiver_phone', receiver_phone);
      const parts = item.roomId.split('_');
      const receiverId =
        parts.find((p) => p !== this.userId) ?? parts[parts.length - 1];
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId: receiverId },
      });
    }
  }

  /* ---------- selection helpers ---------- */
  get selectionMeta() {
    const sel = this.selected || [];
    const hasPriv = sel.some((s) => s.type !== 'group');
    const hasGroup = sel.some((s) => s.type == 'group');
    return {
      count: sel.length,
      onlyPrivates: hasPriv && !hasGroup,
      onlyGroups: !hasPriv && hasGroup,
      mixed: hasPriv && hasGroup,
    };
  }

  isSelected(it: IConversation): boolean {
    return this.selected.some((s) => s.roomId === it.roomId);
  }

  toggleSelection(it: IConversation, ev?: Event) {
    if (ev) ev.stopPropagation();
    const i = this.selected.findIndex((s) => s.roomId === it.roomId);
    if (i > -1) this.selected.splice(i, 1);
    else this.selected.push(it);
    if (this.selected.length === 0) this.cancelLongPress();
  }

  clearSelection() {
    this.selected = [];
    this.cancelLongPress();
  }

  onRowClick(it: IConversation, ev: Event) {
    if (this.selected.length > 0) {
      this.toggleSelection(it, ev);
      return;
    }
    this.open(it);
  }

  startLongPress(it: IConversation) {
    this.cancelLongPress();
    this.longPressTimer = setTimeout(() => {
      if (!this.isSelected(it)) this.selected = [it];
    }, 500);
  }

  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /* ---------- header actions ---------- */

  // bulk unarchive from header
  async unarchiveSelected() {
    await this.firebaseChat.setArchiveConversation(
      this.selected.map((c) => c.roomId),
      false
    );
    // optimistic UI
    const selectedIds = new Set(this.selected.map((s) => s.roomId));
    this.items = this.items.filter((i) => !selectedIds.has(i.roomId));
    this.clearSelection();
  }

  // delete for me — only privates
  async deleteSelected() {
    const db = getDatabase();
    const privates = this.selected.filter((s) => s.type !== 'group');
    if (privates.length === 0) {
      this.clearSelection();
      return;
    }

    await Promise.all(
      privates.map(async (it) => {
        try {
          await this.firebaseChat.deleteChatForUser(it.roomId, this.userId);
        } catch {}
        try {
          await remove(
            rtdbRef(db, `archivedChats/${this.userId}/${it.roomId}`)
          );
        } catch {}
      })
    );

    const toRemove = new Set(privates.map((p) => p.roomId));
    this.items = this.items.filter((it) => !toRemove.has(it.roomId));
    this.clearSelection();
  }
}
