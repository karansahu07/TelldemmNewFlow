import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';

@Component({
  selector: 'app-message-info',
  templateUrl: './message-info.page.html',
  styleUrls: ['./message-info.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class MessageInfoPage implements OnInit {
  message: any = null;
  messageKey: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: FirebaseChatService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // 1) Preferred: try to read the message object stored in the service by chat screen
    const svcMsg = this.chatService.getSelectedMessageInfo(true);  
    if (svcMsg) {
      this.message = svcMsg;
      return;
    }

    // 2) Next: try to read full message passed via navigation state
    const navStateMsg = (this.router.getCurrentNavigation()?.extras?.state as any)?.message;
    if (navStateMsg) {
      this.message = navStateMsg;
      return;
    }

    // 3) Fallback: if only a key was passed via query params, capture it and show placeholder
    this.route.queryParams.subscribe(params => {
      const key = params['messageKey'];
      if (key) {
        this.messageKey = key;
        // populate minimal placeholder so template can render something useful
        this.message = { key, text: '(message details unavailable)', timestamp: null };
        // optional: show a toast informing user we couldn't find full message object
        this.showInfoToast();
      }
    });
  }

  private async showInfoToast() {
    const t = await this.toastCtrl.create({
      message: 'Full message data not available — opened from key only.',
      duration: 2000,
      color: 'medium'
    });
    await t.present();
  }

    formatDate(ts: any): string {
    if (!ts && ts !== 0) return '';

    // Accept number or numeric string. If ts looks like seconds (10-digit), convert to ms.
    let tnum: number;
    if (typeof ts === 'string') {
      // try parse numeric string
      const parsed = Number(ts);
      if (Number.isNaN(parsed)) {
        // try Date parse fallback
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        return this.formatDateFromDate(d);
      }
      tnum = parsed;
    } else if (typeof ts === 'number') {
      tnum = ts;
    } else {
      return '';
    }

    // If timestamp seems to be in seconds (<= 1e10), convert to ms
    if (tnum < 1e11) {
      tnum = tnum * 1000;
    }

    const d = new Date(tnum);
    if (isNaN(d.getTime())) return '';

    return this.formatDateFromDate(d);
  }

  private formatDateFromDate(d: Date): string {
    const now = new Date();

    // strip time portion for day comparison
    const sameDay = d.getFullYear() === now.getFullYear()
      && d.getMonth() === now.getMonth()
      && d.getDate() === now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.getFullYear() === yesterday.getFullYear()
      && d.getMonth() === yesterday.getMonth()
      && d.getDate() === yesterday.getDate();

    const timeStr = this.formatTime(d);

    if (sameDay) {
      return `Today at ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    } else {
      // dd/mm/yyyy, hh:mm AM/PM
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}, ${timeStr}`;
    }
  }

  private formatTime(d: Date): string {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const mins = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${mins} ${ampm}`;
  }

}
