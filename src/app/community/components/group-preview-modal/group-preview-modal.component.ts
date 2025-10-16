// import { Component, Input } from '@angular/core';
// import { IonicModule, ModalController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-group-preview-modal',
//   templateUrl: './group-preview-modal.component.html',
//   styleUrls: ['./group-preview-modal.component.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule]
// })
// export class GroupPreviewModalComponent {
//   @Input() group: any;
//   @Input() communityName = '';
//   @Input() currentUserId = '';
//   @Input() currentUserName = '';
//   @Input() currentUserPhone = '';

//   constructor(private modalCtrl: ModalController) {}

//   get memberKeys(): string[] {
//     if (!this.group || !this.group.rawMembers) return [];
//     return Object.keys(this.group.rawMembers);
//   }

//   memberObj(key: string): any {
//     return this.group && this.group.rawMembers ? this.group.rawMembers[key] : null;
//   }

//   initialsFor(mem: any): string {
//     const n: string = mem?.name || '';
//     if (!n) return mem?.phone_number ? String(mem.phone_number).slice(-2) : 'U';

//     // explicit types for callbacks to satisfy noImplicitAny
//     const initials = n
//       .split(' ')
//       .map((s: string) => (s && s.length > 0 ? s[0] : ''))
//       .filter((ch: string) => !!ch)
//       .slice(0, 2)
//       .join('')
//       .toUpperCase();

//     return initials || 'U';
//   }

//   get createdByText(): string {
//     //console.log("createdBy",this.group.createdBy, this.group.createdByName);
//     const cb = (this.group?.createdBy || this.group?.created_by) ?? '';
//     return cb ? `Created by ${cb}` : '';
//   }

//   close(): void {
//     this.modalCtrl.dismiss();
//   }

//   join(): void {
//     this.modalCtrl.dismiss({ action: 'join', groupId: this.group?.id });
//   }
// }


import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-group-preview-modal',
  templateUrl: './group-preview-modal.component.html',
  styleUrls: ['./group-preview-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class GroupPreviewModalComponent {
  @Input() group: any;
  @Input() communityName = '';
  @Input() currentUserId = '';
  @Input() currentUserName = '';
  @Input() currentUserPhone = '';

  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) {}

  get memberKeys(): string[] {
    if (!this.group || !this.group.rawMembers) return [];
    return Object.keys(this.group.rawMembers);
  }

  memberObj(key: string): any {
    return this.group && this.group.rawMembers ? this.group.rawMembers[key] : null;
  }

  initialsFor(mem: any): string {
    const n: string = mem?.name || '';
    if (!n) return mem?.phone_number ? String(mem.phone_number).slice(-2) : 'U';

    const initials = n
      .split(' ')
      .map((s: string) => (s && s.length > 0 ? s[0] : ''))
      .filter((ch: string) => !!ch)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return initials || 'U';
  }

  /**
   * Localized "Created by {{name}}"
   * (Date is appended in the template with Angular date pipe)
   */
  get createdByText(): string {
    const name =
      this.group?.createdByName ||
      this.group?.createdBy ||
      this.group?.created_by ||
      '';
    if (!name) return '';
    return this.translate.instant('group_preview_modal_component.createdBy', { name });
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  join(): void {
    this.modalCtrl.dismiss({ action: 'join', groupId: this.group?.id });
  }

  setDefaultAvatar(event: Event) {
    try {
      const img = event?.target as HTMLImageElement | null;
      if (!img) return;
      img.onerror = null;
      img.src = this.avatarFallbackUrl();
    } catch (e) {
      console.warn('setDefaultAvatar error', e);
    }
  }

  avatarFallbackUrl(): string {
    return 'assets/images/user.jfif';
  }
}
