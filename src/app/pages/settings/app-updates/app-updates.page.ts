import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { VersionCheck } from 'src/app/services/version-check';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'settings.appUpdates';
const CURRENT_VERSION_KEY = 'app_current_version';
const LATEST_VERSION_KEY = 'app_latest_version';
const UPDATE_AVAILABLE_KEY = 'app_update_available';

@Component({
  selector: 'app-app-updates',
  templateUrl: './app-updates.page.html',
  styleUrls: ['./app-updates.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
})
export class AppUpdatesPage implements OnInit {
  version = '0.0.0'; // fallback
  latestVersion: string | null = null;
  updateAvailable = false;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private versionCheck: VersionCheck,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  private loadSettings() {
    const storedCurrent = localStorage.getItem(CURRENT_VERSION_KEY);
    const storedLatest = localStorage.getItem(LATEST_VERSION_KEY);
    const storedUpdateAvail = localStorage.getItem(UPDATE_AVAILABLE_KEY);

    this.version = storedCurrent || this.version; // fallback stays if null
    this.latestVersion = storedLatest || null;
    this.updateAvailable = storedUpdateAvail === 'true';
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  ionViewWillLeave() {
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: this.version,
        latestVersion: this.latestVersion,
        updateAvailable: this.updateAvailable,
      })
    );
  }

  async checkForUpdates() {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('appUpdates.checking'),
    });
    await loading.present();

    try {
      const result = await this.versionCheck.checkAndNotify();

      //console.log("result",result);

      // Update UI
      this.version = result.currentVersion || this.version;
      this.latestVersion = result.latestVersion;
      this.updateAvailable = result.updateAvailable;

      const msg = result.updateAvailable
        ? this.translate.instant('appUpdates.toast.updateAvailable', { version: result.latestVersion })
        : this.translate.instant('appUpdates.toast.latest');

      const toast = await this.toastCtrl.create({
        message: msg,
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('appUpdates.toast.error'),
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
    } finally {
      loading.dismiss();
    }
  }
}
