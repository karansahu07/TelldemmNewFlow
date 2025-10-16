// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, NavController } from '@ionic/angular';

// @Component({
//   selector: 'app-change-group-name',
//   standalone : true,
//   templateUrl: './change-group-name.page.html',
//   styleUrls: ['./change-group-name.page.scss'],
//   imports: [IonicModule, FormsModule, CommonModule]
// })
// export class ChangeGroupNamePage {
//   groupName: string = '';

//   constructor(private navCtrl: NavController) {}

//   onCancel() {
//     this.navCtrl.back(); // Go back to previous screen
//   }

//   onSave() {
//     const trimmedName = this.groupName.trim();
//     if (trimmedName.length === 0) return;

//     // TODO: Save to Firebase or emit via socket
//     //console.log('Group name saved:', trimmedName);

//     this.navCtrl.back(); // Navigate back after saving
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { getDatabase, ref, set } from 'firebase/database';

@Component({
  selector: 'app-change-group-name',
  standalone: true,
  templateUrl: './change-group-name.page.html',
  styleUrls: ['./change-group-name.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ChangeGroupNamePage implements OnInit {
  groupName: string = '';
  groupId: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';
    if (!this.groupId) {
      console.warn('Group ID not provided in query params');
      this.navCtrl.back();
    }
  }

  onCancel() {
    this.navCtrl.back();
  }

  async onSave() {
    const trimmedName = this.groupName.trim();
    if (!trimmedName) return;

    const db = getDatabase();
    const nameRef = ref(db, `groups/${this.groupId}/name`);

    try {
      await set(nameRef, trimmedName);

      const toast = await this.toastCtrl.create({
        message: 'Group name updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.back(); // Go back after saving
    } catch (err) {
      console.error('Error updating group name:', err);
      const toast = await this.toastCtrl.create({
        message: 'Failed to update group name',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
