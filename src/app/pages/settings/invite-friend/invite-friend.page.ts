import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // 👈 add

@Component({
  selector: 'app-invite-friend',
  templateUrl: './invite-friend.page.html',
  styleUrls: ['./invite-friend.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule], // 👈 add
})
export class InviteFriendPage implements OnInit {
  constructor(
    private toastCtrl: ToastController,
    private translate: TranslateService, // 👈 inject
  ) {}

  ngOnInit() {}

  async shareLink() {
    try {
      await Share.share({
        title: this.translate.instant('invite.title'),
        text: this.translate.instant('invite.text'),
        url: 'https://play.google.com/store/apps/details?id=com.ekarigar.telldemm',
        dialogTitle: this.translate.instant('invite.dialogTitle'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
      this.showToast(this.translate.instant('invite.errors.shareFailed'));
    }
  }

  openContacts() {
    this.showToast(this.translate.instant('invite.toasts.openContacts'));
  }

  searchContacts() {
    this.showToast(this.translate.instant('invite.toasts.searchContacts'));
  }

  invite(phone: string) {
    this.showToast(this.translate.instant('invite.toasts.invited', { phone }));
  }

  private async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
