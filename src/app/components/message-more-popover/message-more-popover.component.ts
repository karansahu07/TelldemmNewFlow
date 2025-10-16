// import { Component } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-message-more-popover',
//   templateUrl: './message-more-popover.component.html',
//   standalone: true,
//   imports: [IonicModule, CommonModule],
// })
// export class MessageMorePopoverComponent {
//   constructor(private popoverCtrl: PopoverController) {}

//   selectOption(action: string) {
//     this.popoverCtrl.dismiss(action);
//   }
// }



// import { Component, Input } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-message-more-popover',
//   templateUrl: './message-more-popover.component.html',
//   standalone: true,
//   imports: [IonicModule, CommonModule],
// })
// export class MessageMorePopoverComponent {
//   @Input() hasText: boolean = true;
//   @Input() hasAttachment: boolean = false;

//   constructor(private popoverCtrl: PopoverController) {}

//   selectOption(action: string) {
//     this.popoverCtrl.dismiss(action);
//   }

//   get showInfo(): boolean {
//     return true;
//   }

//   get showCopy(): boolean {
//     return this.hasText;
//   }

//   get showShare(): boolean {
//     return this.hasAttachment;
//   }

//   get showPin(): boolean {
//     return true;
//   }
// }

import { Component, Input } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-more-popover',
  templateUrl: './message-more-popover.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class MessageMorePopoverComponent {
  @Input() hasText: boolean = true;
  @Input() hasAttachment: boolean = false;
  @Input() isPinned: boolean = false;
  @Input() message: any;
  @Input() currentUserId: string = '';

  constructor(private popoverCtrl: PopoverController) {}

  selectOption(action: string) {
    this.popoverCtrl.dismiss(action);
  }

  get showInfo(): boolean {
    return true;
  }

  get showCopy(): boolean {
    return this.hasText;
  }

  get showShare(): boolean {
    return this.hasAttachment;
  }

  get showPin(): boolean {
    return !this.isPinned; // ✅ Only show Pin if not already pinned
  }

  get showUnpin(): boolean {
    return this.isPinned; // ✅ Only show Unpin if already pinned
  }

    get showEdit(): boolean {
    if (!this.message) return false;

    const now = Date.now();
    const msgTime = new Date(this.message.timestamp).getTime();
    const diff = now - msgTime;

    return this.message.sender_id === this.currentUserId && diff < (15 * 60 * 1000);
  }

}
