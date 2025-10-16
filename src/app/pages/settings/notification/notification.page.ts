import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'settings.notifications';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
})
export class NotificationPage implements OnInit {
  highPriority = true;

  constructor(private router: Router, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  openMessageNotifications() {
    this.router.navigate(['settings/notifications/message']);
  }

  openGroupNotifications() {
    this.router.navigate(['settings/notifications/group']);
  }

  openCallNotifications() {
    this.router.navigate(['settings/notifications/call']);
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.highPriority === 'boolean') {
        this.highPriority = data.highPriority;
      }
    } catch (e) {
      console.warn('Could not load notification settings', e);
    }
  }

  ionViewWillLeave() {
    this.saveSettings();
  }

  private saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ highPriority: this.highPriority })
      );
    } catch (e) {
      console.warn('Could not save notification settings', e);
    }
  }
}
