import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'settings.chats';

type FontSize = 'small' | 'medium' | 'large';

interface ChatsSettings {
  enterToSend: boolean;
  mediaVisibility: boolean;
  keepArchived: boolean;
  fontSize: FontSize;
  voiceTranscriptsEnabled: boolean;
}

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
})
export class ChatsPage implements OnInit {
  enterToSend = false;
  mediaVisibility = true;
  keepArchived = true;
  fontSize: FontSize = 'medium';
  voiceTranscriptsEnabled = false;

  preview = 'assets/wallpaper-preview.jpg';
  lastBackup: string | null = null;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadLastBackup();
  }

  /* ---------- Navigation ---------- */
  openTheme() {
    this.router.navigate(['settings', 'chats', 'theme']);
  }
  openChatTheme() {
    this.router.navigate(['settings', 'chats', 'wallpaper']);
  }
  openFontSize() {
    this.router.navigate(['settings', 'chats', 'font-size']);
  }
  openChatBackup() {
    this.router.navigate(['settings', 'chats', 'backup']);
  }
  openTransferChats() {
    this.router.navigate(['settings', 'chats', 'transfer']);
  }
  openChatHistory() {
    this.router.navigate(['settings', 'chats', 'history']);
  }

  /* ---------- Toggle handlers (with i18n toasts) ---------- */
  async toggleEnterToSend() {
    this.enterToSend = !this.enterToSend;
    this.saveSettings();
    await this.showToast(
      this.translate.instant(
        this.enterToSend ? 'chats.toasts.enter.enabled' : 'chats.toasts.enter.disabled'
      )
    );
  }

  async toggleMediaVisibility() {
    this.mediaVisibility = !this.mediaVisibility;
    this.saveSettings();
    await this.showToast(
      this.translate.instant(
        this.mediaVisibility ? 'chats.toasts.media.on' : 'chats.toasts.media.off'
      )
    );
  }

  async toggleKeepArchived() {
    this.keepArchived = !this.keepArchived;
    this.saveSettings();
    await this.showToast(
      this.translate.instant(
        this.keepArchived ? 'chats.toasts.archived.enabled' : 'chats.toasts.archived.disabled'
      )
    );
  }

  async toggleVoiceMessageTranscripts() {
    this.voiceTranscriptsEnabled = !this.voiceTranscriptsEnabled;
    this.saveSettings();
    await this.showToast(
      this.translate.instant(
        this.voiceTranscriptsEnabled ? 'chats.toasts.transcripts.enabled' : 'chats.toasts.transcripts.disabled'
      )
    );
  }

  /* ---------- Persistence ---------- */
  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s: Partial<ChatsSettings> = JSON.parse(raw);
      if (typeof s.enterToSend === 'boolean') this.enterToSend = s.enterToSend;
      if (typeof s.mediaVisibility === 'boolean') this.mediaVisibility = s.mediaVisibility;
      if (typeof s.keepArchived === 'boolean') this.keepArchived = s.keepArchived;
      if (s.fontSize === 'small' || s.fontSize === 'medium' || s.fontSize === 'large') this.fontSize = s.fontSize;
      if (typeof s.voiceTranscriptsEnabled === 'boolean') this.voiceTranscriptsEnabled = s.voiceTranscriptsEnabled;
    } catch (e) {
      console.warn('Could not load chat settings', e);
    }
  }

  saveSettings() {
    const s: ChatsSettings = {
      enterToSend: this.enterToSend,
      mediaVisibility: this.mediaVisibility,
      keepArchived: this.keepArchived,
      fontSize: this.fontSize,
      voiceTranscriptsEnabled: this.voiceTranscriptsEnabled
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn('Could not save chat settings', e);
    }
  }

  /* ---------- Helpers ---------- */
  async showToast(message: string, duration = 1400) {
    const t = await this.toastCtrl.create({ message, duration, position: 'bottom' });
    await t.present();
  }

  loadLastBackup() {
    this.lastBackup = localStorage.getItem('chats.lastBackup') || null;
  }

  async startBackup() {
    await this.showToast(this.translate.instant('chats.toasts.backup.starting'), 800);
    const now = new Date().toISOString();
    localStorage.setItem('chats.lastBackup', now);
    this.lastBackup = now;
    await this.showToast(this.translate.instant('chats.toasts.backup.done'));
  }
}
