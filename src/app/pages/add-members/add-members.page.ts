import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ContactSyncService } from 'src/app/services/contact-sync.service'; // adjust if path differs
import { get, child, getDatabase, ref as dbRef, update, ref } from 'firebase/database';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.page.html',
  styleUrls: ['./add-members.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AddMembersPage implements OnInit {
  searchText = '';
  allUsers: any[] = [];
  filteredContacts: any[] = [];
  isLoading = false;
  groupId: string = '';

  constructor(
    private navCtrl: NavController,
    private contactSyncService: ContactSyncService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private service : ApiService
  ) {}

  ngOnInit() {
    this.loadDeviceMatchedContacts();
    this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';
    // //console.log("load device contacts",this.loadDeviceMatchedContacts);
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
  const toast = await this.toastCtrl.create({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });
  toast.present();
}

  async loadDeviceMatchedContacts() {
  const currentUserPhone = this.authService.authData?.phone_number;
  // const currentUserPhone = localStorage.getItem('phone_number');
  this.allUsers = [];
  this.isLoading = true;

  try {
    // Get already added members
    const db = getDatabase();
    const membersSnap = await get(dbRef(db, `groups/${this.groupId}/members`));
    const existingMembers = membersSnap.exists() ? membersSnap.val() : {};
    const existingIds = Object.keys(existingMembers);

    const matchedUsers = await this.contactSyncService.getMatchedUsers();
    matchedUsers.forEach((user : any) => {
      if (user.phone_number !== currentUserPhone) {
        const isAlreadyAdded = existingIds.includes(user.user_id);
        this.allUsers.push({
          ...user,
          name: user.name || user.phone_number,
          message: user.bio || '',
          image: user.image || 'assets/images/user.jfif',
          receiver_Id: user.phone_number,
          selected: false,
          disabled: isAlreadyAdded
        });
      }
    });

    this.filteredContacts = [...this.allUsers];
  } catch (err) {
    console.error('Error loading matched contacts:', err);
  } finally {
    this.isLoading = false;
  }
}

  get selectedUsers() {
    return this.allUsers.filter(user => user.selected);
  }

  toggleSelect(user: any) {
    user.selected = !user.selected;
  }

  filteredUsers() {
    const search = this.searchText.toLowerCase();
    return this.filteredContacts.filter(user =>
      user.name?.toLowerCase().includes(search)
    );
  }

async addSelectedMembers() {
  if (!this.groupId) {
    this.showToast('Group ID not found', 'danger');
    return;
  }

  const selected = this.selectedUsers.map(u => ({
    user_id: u.user_id,
    name: u.name,
    phone_number: u.phone_number
  }));

  if (selected.length === 0) {
    this.showToast('No members selected', 'danger');
    return;
  }

  const db = getDatabase();
  const updates: any = {};

  selected.forEach(member => {
    // Add to group members in Firebase
    updates[`groups/${this.groupId}/members/${member.user_id}`] = {
      name: member.name,
      phone_number: member.phone_number,
      status: 'active',
      role: 'member'
    };

    // Remove from pastmembers if exists
    updates[`groups/${this.groupId}/pastmembers/${member.user_id}`] = null;
  });

  try {
    // Update Firebase
    await update(ref(db), updates);

    // Get backendGroupId from Firebase
    const backendGroupIdSnap = await get(ref(db, `groups/${this.groupId}/backendGroupId`));
    const backendGroupId = backendGroupIdSnap.val();

    if (!backendGroupId) {
      this.showToast("Backend group ID missing", "danger");
      return;
    }

    // Sync each member to backend
    selected.forEach(member => {
      this.service.addGroupMember(
        Number(backendGroupId), // backend group_id
        Number(member.user_id), // user_id
        2 // role_id (2 = member, 1 = admin etc.)
      ).subscribe({
        next: () => {},
        error: () => {
          this.showToast(`Failed to sync member ${member.name}`, 'danger');
        }
      });
    });

    this.showToast('Members added successfully 🎉', 'success');
    this.navCtrl.back();

  } catch {
    this.showToast('Error adding members', 'danger');
  }
}


  checkboxChanged(user: any) {
    user.selected = !user.selected;
  }
}