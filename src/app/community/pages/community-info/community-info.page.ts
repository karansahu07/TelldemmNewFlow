import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  IonContent,
  NavController,
  IonRouterOutlet,
} from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-community-info',
  templateUrl: './community-info.page.html',
  styleUrls: ['./community-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CommunityInfoPage implements OnInit {
  @ViewChild(IonContent, { static: true }) content!: IonContent;

  communityId: string | null = null;
  communityName: string | null = null;
  memberCount = 0;
  groupCount = 0;

  // segment: 'community' | 'announcements'
  segment: 'community' | 'announcements' = 'community';

  // sample / placeholder community data (replace with real fetch)
  community: any = {
    name: '',
    icon: '',
    description:
      'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((q) => {
      this.communityId = q['communityId'] || q['id'] || null;
      this.communityName = q['communityName'] || q['name'] || null;

      // load counts if you want (placeholders for now)
      this.memberCount = q['members'] ? Number(q['members']) : 2;
      this.groupCount = q['groups'] ? Number(q['groups']) : 4;

      if (this.communityName) this.community.name = this.communityName;
    });

    // if you want: fetch community data here using a service
    // this.loadCommunity();
  }

  async onSegmentChanged(ev?: any) {
    // when segment changes, gently scroll to the corresponding section
    this.segment = (ev && ev.detail && ev.detail.value) || this.segment;
    await this.scrollToSegment(this.segment);
  }

  async scrollToSegment(seg: 'community' | 'announcements') {
    // short delay so layout stabilized
    await new Promise((r) => setTimeout(r, 80));
    const elId = seg === 'community' ? 'section-community' : 'section-announcements';
    const el = document.getElementById(elId);
    if (!el) {
      // fallback: scroll to top
      await this.content.scrollToTop(300);
      return;
    }
    // compute offsetTop relative to ion-content scroll container
    const top = el.offsetTop;
    await this.content.scrollToPoint(0, top, 300);
  }

  // button actions (wire to your logic / services)
  invite() {
    // navigate to invite page or call share link
    //console.log('invite');
    // this.router.navigate(['/community-invite'], { queryParams: { communityId: this.communityId }});
  }

  addMembers() {
    // go to add members page (pass communityId)
    this.router.navigate(['/load-all-members'], {
      queryParams: { communityId: this.communityId, communityName: this.communityName },
    });
  }

  addGroups() {
    // go to add-existing-groups, pass communityId
    this.router.navigate(['/add-existing-groups'], {
      queryParams: { communityId: this.communityId, communityName: this.communityName },
    });
  }

  // menu actions for community options
  editCommunity() {
    //console.log('edit community');
    // navigate to edit page...
  }
  manageGroups() {
    this.router.navigate(['/manage-groups'], {
      queryParams: { communityId: this.communityId },
    });
  }
  communitySettings() {
    //console.log('open community settings');
  }
  viewGroups() {
    this.router.navigate(['/community-groups'], {
      queryParams: { communityId: this.communityId },
    });
  }
  assignNewOwner() {
    //console.log('assign owner');
  }
  exitCommunity() {
    //console.log('exit community');
  }
  reportCommunity() {
    //console.log('report community');
  }
  deactivateCommunity() {
    //console.log('deactivate community');
  }

  // announcement-section actions
  notifications() {
    //console.log('notifications');
  }
  mediaVisibility() {
    //console.log('media visibility');
  }
  disappearingMessages() {
    //console.log('disappearing messages');
  }
  chatLock() {
    //console.log('chat lock');
  }
  phoneNumberPrivacy() {
    //console.log('phone privacy');
  }

  // go back
  back() {
    this.navCtrl.back();
  }
}
