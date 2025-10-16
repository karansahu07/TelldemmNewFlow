import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonInput, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactSyncService } from 'src/app/services/contact-sync.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-load-all-members',
  templateUrl: './load-all-members.page.html',
  styleUrls: ['./load-all-members.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoadAllMembersPage implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

  allUsers: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;

  // search
  showSearchBar = false;
  searchTerm = '';

  // optional community context (read from query params if present)
  communityId: string | null = null;
  communityName: string | null = null;

  constructor(
    private contactSyncService: ContactSyncService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // read community params if any
    this.route.queryParams.subscribe(params => {
      this.communityId = params['communityId'] || params['id'] || null;
      this.communityName = params['communityName'] || null;
      // load contacts once params are read
      this.loadDeviceMatchedContacts();
    });
  }

  async loadDeviceMatchedContacts() {
    this.isLoading = true;
    this.allUsers = [];
    this.filteredUsers = [];

    try {
      const currentUserPhone = this.authService.authData?.phone_number;
      const matched = await this.contactSyncService.getMatchedUsers();

      (matched || []).forEach((u: any) => {
        // skip yourself
        if (u.phone_number && currentUserPhone && u.phone_number === currentUserPhone) return;

        this.allUsers.push({
          user_id: u.user_id ?? u.userId ?? null,
          phone_number: u.phone_number ?? u.receiver_Id ?? null,
          name: u.name ?? u.displayName ?? (u.phone_number ? u.phone_number : 'Unknown'),
          profile: u.profile_picture_url ?? u.profile ?? null,
          bio: u.bio ?? u.message ?? '',
          selected: false
        });
      });

      // copy to filtered
      this.filteredUsers = [...this.allUsers];
    } catch (err) {
      console.error('loadDeviceMatchedContacts error', err);
      this.allUsers = [];
      this.filteredUsers = [];
    } finally {
      this.isLoading = false;
    }
  }

  toggleSelect(u: any) {
    u.selected = !u.selected;
    this.reorderList();
  }

  reorderList() {
    const selected = this.filteredUsers.filter(x => x.selected);
    const others = this.filteredUsers.filter(x => !x.selected);
    this.filteredUsers = [...selected, ...others];
  }

  get selectedCount(): number {
    return this.allUsers.filter(u => u.selected).length;
  }

  get selectedMembers() {
    return this.allUsers.filter(u => u.selected);
  }

  toggleSearch() {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchTerm = '';
      this.filterList();
    } else {
      setTimeout(() => this.searchInput?.setFocus(), 200);
    }
  }

  filterList() {
    const t = (this.searchTerm || '').toLowerCase().trim();
    if (!t) {
      this.filteredUsers = [...this.allUsers];
      this.reorderList();
      return;
    }
    this.filteredUsers = this.allUsers.filter(u =>
      (u.name || '').toLowerCase().includes(t) ||
      (u.bio || '').toLowerCase().includes(t) ||
      (u.phone_number || '').toString().includes(t)
    );
    this.reorderList();
  }

  getInitial(name: string) {
    if (!name || !name.trim()) return '?';
    return name.trim().charAt(0).toUpperCase();
  }

  // --- UPDATED: show confirmation dialog before proceeding ---
  // async confirmSelection() {
  //   const selected = this.selectedMembers;
  //   if (!selected || selected.length === 0) {
  //     const a = await this.alertCtrl.create({
  //       header: 'No members selected',
  //       message: 'Please select at least one member to continue.',
  //       buttons: ['OK']
  //     });
  //     await a.present();
  //     return;
  //   }

  //   // Build message using community name if available
  //   const communityLabel = this.communityName ? `"${this.communityName}"` : 'this community';
  //   const msg = `Members will also be added to the community ${communityLabel} and its announcement group.`;

  //   const alert = await this.alertCtrl.create({
  //     header: 'Confirm',
  //     message: msg,
  //     cssClass: 'confirm-add-members-alert',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel'
  //       },
  //       {
  //         text: 'Continue',
  //         handler: () => {
  //           // Navigate to confirm page with selected members and community context
  //           this.router.navigate(['/confirm-add-existing-groups'], {
  //             state: {
  //               selectedMembers: selected,
  //               communityId: this.communityId,
  //               communityName: this.communityName
  //             }
  //           });
  //         }
  //       }
  //     ]
  //   });

  //   await alert.present();
  // }

  async confirmSelection() {
  const selected = this.selectedMembers;
  if (!selected || selected.length === 0) {
    const a = await this.alertCtrl.create({
      header: 'No members selected',
      message: 'Please select at least one member to continue.',
      buttons: ['OK']
    });
    await a.present();
    return;
  }

  const communityLabel = this.communityName ? `"${this.communityName}"` : 'this community';
  const msg = `Members will also be added to the community ${communityLabel} and its announcement group.`;

  const alert = await this.alertCtrl.create({
    header: 'Confirm',
    message: msg,
    cssClass: 'confirm-add-members-alert',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Continue',
        handler: () => {
          // ✅ Redirect back to create-new-group page with selected members
          this.router.navigate(['/create-new-group'], {
            state: {
              selectedMembers: selected,
              communityId: this.communityId,
              communityName: this.communityName
            }
          });
        }
      }
    ]
  });

  await alert.present();
}

}
