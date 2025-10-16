

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-existing-groups',
  templateUrl: './add-existing-groups.page.html',
  styleUrls: ['./add-existing-groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,TranslateModule]
})
export class AddExistingGroupsPage implements OnInit {
  communityId: string | null = null;
  userId: string | null = null;
  groups: Array<any> = [];
  loading = false;
  selectedCount = 0;
  totalGroups = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService,private translate: TranslateService
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;
    this.route.queryParams.subscribe(params => {
      this.communityId = params['communityId'] || params['id'] || null;
      this.loadAdminGroups();
    });
  }

  // Load groups where this user is admin AND exclude community groups (keys starting with 'comm_group_')
  // ALSO skip groups that already belong to any community (group.communityId present)
  async loadAdminGroups() {
    if (!this.userId) {
      console.error('No userId available');
      return;
    }

    this.loading = true;
    this.groups = [];
    let skippedBecauseCommunity = 0;

    try {
      const groupIds = await this.firebaseService.getGroupsForUser(this.userId);

      for (const gid of groupIds || []) {
        if (typeof gid !== 'string') continue;

        // skip groups that are already community-linked by naming convention
        if (gid.startsWith('comm_group_')) {
          skippedBecauseCommunity++;
          continue;
        }

        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g || !g.members) continue;

        // skip groups that already have a communityId set on the group node
        if (g.communityId) {
          skippedBecauseCommunity++;
          continue;
        }

        const me = g.members[this.userId];
        if (!me) continue;

        const role = (me.role || '').toLowerCase();
        if (role === 'admin' || role === 'owner' || role === 'creator') {
          const memberKeys = Object.keys(g.members || {}).slice(0, 4);
          const previewNames = memberKeys.map(k => g.members[k]?.name || k).join(', ');

          this.groups.push({
            id: gid,
            name: g.name || this.translate.instant('add_existing_groups_page.unnamedGroup'), // 👈 localized fallback
            dp: g.dp || '',
            type: g.type || 'normal',
            membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
            membersPreview: previewNames,
            selected: false,
            raw: g
          });
        }
      }

      this.totalGroups = this.groups.length;
      this.reorderGroups();
    } catch (err) {
      console.error('loadAdminGroups error', err);
    } finally {
      this.loading = false;
      this.selectedCount = this.groups.filter(g => g.selected).length;
    }
  }

  toggleSelect(g: any) {
    g.selected = !g.selected;
    this.onSelectChange();
  }

 onSelectChange() {
    this.selectedCount = this.groups.filter(g => g.selected).length;
    this.reorderGroups();
  }

  reorderGroups() {
    const selected = this.groups.filter(g => g.selected);
    const others = this.groups.filter(g => !g.selected);
    this.groups = [...selected, ...others];
  }

  get selectedGroups() {
    return this.groups.filter(g => g.selected).slice(0, 12);
  }

   // 👉 Forward FAB handler: redirect to confirm page with selected groups
  async confirmSelection() {
    const selectedGroups = this.groups.filter(g => g.selected);

    if (!selectedGroups || selectedGroups.length === 0) {
      const t = await this.toastCtrl.create({
        message: this.translate.instant('add_existing_groups_page.toasts.selectAtLeastOne'),
        duration: 1500,
        color: 'warning'
      });
      await t.present();
      return;
    }

    this.router.navigate(['/confirm-add-existing-groups'], {
      state: {
        groups: selectedGroups,
        communityId: this.communityId,
        communityName: null
      }
    });
  }

}
