// import { Component, Input } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-userabout-menu',
//   standalone: true,
//   imports: [IonicModule, CommonModule],
//   templateUrl: './userabout-menu.component.html',
//   styleUrls: ['./userabout-menu.component.scss']
// })
// export class UseraboutMenuComponent {
//   @Input() chatType: 'private' | 'group' = 'private';

//   constructor(private popoverCtrl: PopoverController) {}

//   close() {
//     this.popoverCtrl.dismiss();
//   }

//   onOptionClick(option: string) {
//     //console.log('Selected:', option);
//     this.popoverCtrl.dismiss({ action: option });
//   }
// }


// import { Component, Input } from '@angular/core';
// import { IonicModule, PopoverController, AlertController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { getDatabase, ref, update, get, child, set } from 'firebase/database';
// // import { ChangeGroupNameComponent } from '../change-group-name/change-group-name.component';
// // import { ModalController } from '@ionic/angular';

// @Component({
//   selector: 'app-userabout-menu',
//   standalone: true,
//   imports: [IonicModule, CommonModule],
//   templateUrl: './userabout-menu.component.html',
//   styleUrls: ['./userabout-menu.component.scss']
// })
// export class UseraboutMenuComponent {
//   @Input() chatType: 'private' | 'group' = 'private';
//   @Input() groupId: string = ''; // 👈 Passed from parent (receiverId)

//   constructor(
//     private popoverCtrl: PopoverController,
//     private alertCtrl: AlertController,
//     //  private modalCtrl: ModalController
//   ) {}

//   close() {
//     this.popoverCtrl.dismiss();
//   }

//   async onOptionClick(option: string) {
//     //console.log('Selected:', option);

//     if (option === 'addMembers') {
//       await this.addMembersToGroup();
//     } else if (option === 'changeGroupName') {
//       await this.promptChangeGroupName();
//     } else {
//       this.popoverCtrl.dismiss({ action: option });
//     }
//   }

//   async addMembersToGroup() {
//     const alert = await this.alertCtrl.create({
//       header: 'Add Member by ID',
//       inputs: [
//         {
//           name: 'userId',
//           type: 'number',
//           placeholder: 'Enter User ID to add'
//         }
//       ],
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel'
//         },
//         {
//           text: 'Add',
//           handler: async data => {
//             const userId = data.userId;
//             if (!userId) return;

//             const db = getDatabase();
//             const groupRef = ref(db, `groups/${this.groupId}/members/${userId}`);

//             try {
//               await set(groupRef, true);
//               //console.log(`User ${userId} added successfully to group ${this.groupId}`);
//               this.popoverCtrl.dismiss({ action: 'memberAdded' });
//             } catch (err) {
//               console.error('Error adding member:', err);
//             }
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }

//   async promptChangeGroupName() {
//     const alert = await this.alertCtrl.create({
//       header: 'Change Group Name',
//       inputs: [
//         {
//           name: 'newName',
//           type: 'text',
//           placeholder: 'Enter new group name'
//         }
//       ],
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel'
//         },
//         {
//           text: 'Update',
//           handler: async data => {
//             const newName = data.newName;
//             if (!newName) return;

//             const db = getDatabase();
//             const groupRef = ref(db, `groups/${this.groupId}/name`);

//             try {
//               await set(groupRef, newName);
//               //console.log('Group name updated to:', newName);
//               this.popoverCtrl.dismiss({ action: 'nameChanged' });
//             } catch (err) {
//               console.error('Error changing group name:', err);
//             }
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }
// }



import { Component, Input } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { getDatabase, ref, set } from 'firebase/database';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userabout-menu',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './userabout-menu.component.html',
  styleUrls: ['./userabout-menu.component.scss']
})
export class UseraboutMenuComponent {
  @Input() chatType: 'private' | 'group' = 'private';
  @Input() groupId: string = ''; // 👈 Passed from parent

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  close() {
    this.popoverCtrl.dismiss();
  }

  async onOptionClick(option: string) {
    //console.log('Selected:', option);

    if (option === 'addMembers') {
      await this.addMembersToGroup(); // Optional: can be kept as-is
    } else if (option === 'changeGroupName') {
      await this.navigateToChangeGroupName();
    } else {
      this.popoverCtrl.dismiss({ action: option });
    }
  }

  // async addMembersToGroup() {
  //   const userId = prompt("Enter User ID to add:");
  //   if (!userId) return;

  //   const db = getDatabase();
  //   const groupRef = ref(db, `groups/${this.groupId}/members/${userId}`);

  //   try {
  //     await set(groupRef, true);
  //     //console.log(`User ${userId} added successfully to group ${this.groupId}`);
  //     this.popoverCtrl.dismiss({ action: 'memberAdded' });
  //   } catch (err) {
  //     console.error('Error adding member:', err);
  //   }
  // }

  async addMembersToGroup() {
  // Navigate to contact screen to select users
  this.popoverCtrl.dismiss(); // Dismiss the popover if open
  this.router.navigate(['/add-members'], {
    queryParams: {
      groupId: this.groupId,
      action: 'add-member'
    }
  });
}

  async navigateToChangeGroupName() {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/change-group-name'], {
      queryParams: { groupId: this.groupId }
    });
  }
}
