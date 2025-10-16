import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { getDatabase, ref, get } from 'firebase/database';

@Component({
  selector: 'app-view-past-members',
  templateUrl: './view-past-members.page.html',
  styleUrls: ['./view-past-members.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ViewPastMembersPage implements OnInit {
  groupId: string = '';
  pastMembers: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      //console.log("pastmembers",this.groupId);
      if (this.groupId) {
        this.loadPastMembers();
      }
    });
  }

  async loadPastMembers() {
  const db = getDatabase();
  const pastRef = ref(db, `groups/${this.groupId}/pastmembers`);

  try {
    const snapshot = await get(pastRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      this.pastMembers = Object.keys(data).map((user_id) => {
        //console.log("pastmembers",this.pastMembers);
        return {
          user_id,
          ...data[user_id]
        };
      });
    } else {
      this.pastMembers = [];
    }
  } catch (error) {
    console.error('Error loading past members:', error);
    this.pastMembers = [];
  }
}

}
