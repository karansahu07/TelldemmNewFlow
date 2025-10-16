import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuPopoverComponent } from '../../components/menu-popover/menu-popover.component'; // Add this impor
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from 'src/app/components/footer-tabs/footer-tabs.component';
register();




@Component({
  selector: 'app-status-screen',
  templateUrl: './status-screen.page.html',
  styleUrls: ['./status-screen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class StatusScreenPage implements OnInit {

  constructor(private popoverCtrl: PopoverController, private router: Router) { }

  ngOnInit() {
  }

  chatList = [
    { name: 'Bob', message: 'How are you?', unread: true, time: '11:00 AM', unreadCount: 0, group: false },
    { name: 'Alice', message: 'Hello', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
  ];

  channelsList = [
    { name: 'News18 India', followers: '14.9M', unread: true, group: false },
    { name: 'Aaj Tak', followers: '12.1M', unread: false, group: false },
    { name: 'NDTV', followers: '10.5M', unread: true, group: false },
    { name: 'India TV', followers: '9.7M', unread: false, group: false },
    { name: 'Zee News', followers: '11.3M', unread: true, group: false },
  ];

  get filteredchannels() {
    if (this.selectedFilter === 'read') {
      return this.channelsList.filter(chat => !chat.unread);
    } else if (this.selectedFilter === 'unread') {
      return this.channelsList.filter(chat => chat.unread);
    } else if (this.selectedFilter === 'groups') {
      return this.channelsList.filter(chat => chat.group);
    } else {
      return this.channelsList;
    }
  }
  
  selectedFilter = 'all'; // default

  get filteredChats() {
    if (this.selectedFilter === 'read') {
      return this.chatList.filter(chat => !chat.unread);
    } else if (this.selectedFilter === 'unread') {
      return this.chatList.filter(chat => chat.unread);
    } else if (this.selectedFilter === 'groups') {
      return this.chatList.filter(chat => chat.group);
    } else {
      return this.chatList; // 'all'
    }
  }

  get totalUnreadUpdates(): number {
    return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  openChat(chat: any) {
    // You can pass chat.id or other details via query params or route params if needed
    this.router.navigate(['/chatting-screen']);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  isRotated = false;

  toggleIcon() {
    this.isRotated = !this.isRotated;
  }
  slideOpts = {
  slidesPerView: 'auto',
  spaceBetween: 5
};
}
