// // import {
// //   Component,
// //   OnInit,
// //   OnDestroy,
// //   inject,
// //   ViewChild,
// //   ElementRef,
// //   AfterViewInit,
// //   QueryList,
// //   Renderer2
// // } from '@angular/core';
// // import {
// //   query,
// //   orderByKey,
// //   endBefore,
// //   limitToLast,
// //   startAfter,
// //   getDatabase,
// //   ref,
// //   get,
// //   update,
// //   set,
// //   remove
// // } from 'firebase/database';
// // import { ActivatedRoute, Router } from '@angular/router';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { AlertController, IonContent, IonicModule, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
// // import { firstValueFrom, Subscription } from 'rxjs';
// // import { Keyboard } from '@capacitor/keyboard';
// // import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// // import { EncryptionService } from 'src/app/services/encryption.service';
// // import { v4 as uuidv4 } from 'uuid';
// // import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
// // import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import { FileUploadService } from '../../services/file-upload/file-upload.service';
// // import { ChatOptionsPopoverComponent } from 'src/app/components/chat-options-popover/chat-options-popover.component';
// // import { IonDatetime } from '@ionic/angular';
// // import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// // import { NavController } from '@ionic/angular';
// // import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';
// // import { FileSystemService } from 'src/app/services/file-system.service';
// // import imageCompression from 'browser-image-compression';
// // import { AttachmentPreviewModalComponent } from '../../components/attachment-preview-modal/attachment-preview-modal.component';
// // import { MessageMorePopoverComponent } from '../../components/message-more-popover/message-more-popover.component';
// // import { Clipboard } from '@capacitor/clipboard';
// // import { Message, PinnedMessage } from 'src/types';
// // import { AuthService } from 'src/app/auth/auth.service';
// // import { ApiService } from 'src/app/services/api/api.service';
// // import { SqliteService } from 'src/app/services/sqlite.service';
// // import { TypingService } from 'src/app/services/typing.service';
// // import { Subject, Subscription as RxSub } from 'rxjs';
// // import { throttleTime } from 'rxjs/operators';
// // import { ref as dbRef, onValue, onDisconnect } from 'firebase/database';

// // @Component({
// //   selector: 'app-chatting-screen',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, IonicModule],
// //   templateUrl: './chatting-screen.page.html',
// //   styleUrls: ['./chatting-screen.page.scss']
// // })
// // export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
// //   @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
// //   @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
// //   @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
// //   @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;
// //   @ViewChild('longPressEl') messageElements!: QueryList<ElementRef>;

// //   messages: Message[] = [];
// //   groupedMessages: { date: string; messages: Message[] }[] = [];

// //   messageText = '';
// //   receiverId = '';
// //   senderId = '';
// //   sender_phone = '';
// //   receiver_phone = '';
// //   private messageSub?: Subscription;
// //   showSendButton = false;
// //   private keyboardListeners: any[] = [];
// //   searchActive = false;
// //   searchQuery = '';
// //   searchMatches: HTMLElement[] = [];
// //   currentMatchIndex = 0;
// //   showSearchBar = false;
// //   searchTerm = '';
// //   searchText = '';
// //   matchedMessages: HTMLElement[] = [];
// //   currentSearchIndex = -1;
// //   isDateModalOpen = false;
// //   selectedDate: string = '';
// //   isDatePickerOpen = false;
// //   showDateModal = false;
// //   selectedMessages: any[] = [];
// //   imageToSend: any;
// //   alertController: any;

// //   private resizeHandler = () => this.setDynamicPadding();
// //   private intersectionObserver?: IntersectionObserver;

// //   constructor(
// //     private chatService: FirebaseChatService,
// //     private route: ActivatedRoute,
// //     private platform: Platform,
// //     private encryptionService: EncryptionService,
// //     private router: Router,
// //     private secureStorage: SecureStorageService,
// //     private fileUploadService: FileUploadService,
// //     private popoverCtrl: PopoverController,
// //     private toastCtrl: ToastController,
// //     private navCtrl: NavController,
// //     private FileService: FileSystemService,
// //     private modalCtrl: ModalController,
// //     private popoverController: PopoverController,
// //     private clipboard: Clipboard,
// //     private authService: AuthService,
// //     private service: ApiService,
// //     private sqliteService: SqliteService,
// //     private alertCtrl: AlertController,
// //     private typingService: TypingService,
// //     private renderer: Renderer2,
// //     private el: ElementRef,
// //   ) { }

// //   roomId = '';
// //   chatType: 'private' | 'group' = 'private';
// //   groupName = '';
// //   isGroup: any;
// //   receiver_name = '';
// //   sender_name = '';
// //   groupMembers: {
// //     user_id: string;
// //     name?: string;
// //     phone?: string;
// //     avatar?: string;
// //     role?: string;
// //     phone_number?: string;
// //     publicKeyHex?: string | null;
// //   }[] = [];
// //   attachments: any[] = [];
// //   selectedAttachment: any = null;
// //   showPreviewModal: boolean = false;
// //   attachmentPath: string = '';
// //   lastPressedMessage: any = null;
// //   longPressTimeout: any;
// //   replyToMessage: Message | null = null;
// //   capturedImage = '';
// //   pinnedMessage: PinnedMessage | null = null;
// //   pinnedMessageDetails: any = null;
// //   private pinnedMessageSubscription: any;
// //   showMobilePinnedBanner: boolean = false;
// //   chatName: string = '';
// //   onlineCount: number = 0;

// //   showPopover = false;
// //   popoverEvent: any;
// //   isSending = false;

// //   limit = 15; // Load 15 messages at a time
// //   page = 0;
// //   isLoadingMore = false;
// //   hasMoreMessages = true;
// //   allMessages: Message[] = []; // Store all messages
// //   displayedMessages: Message[] = []; // Messages currently shown
// //   private lastMessageKey: string | null = null;

// //   receiverProfile: string | null = null;

// //   // --- Typing indicator related ---
// //   private typingInput$ = new Subject<void>();
// //   private typingRxSubs: RxSub[] = [];   // rx subscriptions for typing throttling
// //   typingCount = 0;                      // number of other users typing
// //   typingFrom: string | null = null;     // single user name who is typing
// //   private localTypingTimer: any = null; // inactivity timer to auto stop typing
// //   private typingUnsubscribe: (() => void) | null = null; // to stop onValue listener
// //   typingUsers: { userId: string; name: string | null; avatar: string | null }[] = [];

// //   async ngOnInit() {
// //     // Enable proper keyboard scrolling
// //     Keyboard.setScroll({ isDisabled: false });

// //     // Load sender (current user) details
// //     this.senderId = this.authService.authData?.userId || '';
// //     this.sender_phone = this.authService.authData?.phone_number || '';
// //     this.sender_name = this.authService.authData?.name || '';

// //     const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
// //     this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

// //     // Get query parameters
// //     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
// //     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
// //     const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

// //     // Determine chat type
// //     // Determine chat type
// // this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

// // if (this.chatType === 'group') {
// //   // Group chat
// //   this.roomId = decodeURIComponent(rawId);

// //   // Use service to fetch group name + enriched members (profiles)
// //   try {
// //     const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
// //     this.groupName = groupName;
// //     this.groupMembers = groupMembers;
// //   } catch (err) {
// //     console.warn('Failed to fetch group with profiles', err);
// //     this.groupName = 'Group';
// //     this.groupMembers = [];
// //   }
// // } else {
// //   // Individual chat
// //   this.receiverId = decodeURIComponent(rawId);
// //   this.roomId = this.getRoomId(this.senderId, this.receiverId);

// //   // Use receiver_phone from query or fallback to localStorage
// //   this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
// //   // Store for reuse when navigating to profile
// //   localStorage.setItem('receiver_phone', this.receiver_phone);
// // }

// // // IMPORTANT: attach typing listener for BOTH group and private now
// // this.setupTypingListener();


// //     // Reset unread count and mark messages as read
// //     await this.chatService.resetUnreadCount(this.roomId, this.senderId);
// //     await this.markMessagesAsRead();

// //     try {
// //       const db = getDatabase();

// //       // Setup onDisconnect removal for safety
// //       try {
// //         const myTypingRef = dbRef(db, `typing/${this.roomId}/${this.senderId}`);
// //         onDisconnect(myTypingRef).remove();
// //       } catch (err) {
// //         // ignore if not supported
// //         console.warn('onDisconnect setup failed', err);
// //       }

// //       // Outgoing typing: throttle DB writes
// //       const tsub = this.typingInput$.pipe(
// //         throttleTime(1200, undefined, { leading: true, trailing: true })
// //       ).subscribe(() => {
// //         this.sendTypingSignal();
// //       });
// //       this.typingRxSubs.push(tsub);
// //     } catch (err) {
// //       console.warn('Typing setup error', err);
// //     }

// //     // Load and render messages
// //     this.loadFromLocalStorage();
// //     this.listenForMessages();
// //     this.setupPinnedMessageListener();

// //     this.checkMobileView();

// //     // Scroll to bottom after short delay
// //     setTimeout(() => this.scrollToBottom(), 100);

// //     await this.loadInitialMessages();
// //     this.loadReceiverProfile();
// //   }

// //   onInputTyping() {
// //     // keep existing showSendButton logic
// //     this.onInputChange();

// //     // notify subject to throttle outgoing typing updates
// //     this.typingInput$.next();

// //     // reset local timer
// //     if (this.localTypingTimer) {
// //       clearTimeout(this.localTypingTimer);
// //     }
// //     this.localTypingTimer = setTimeout(() => {
// //       this.stopTypingSignal();
// //     }, 2500);
// //   }

// //   // call on blur to ensure immediate stop
// //   onInputBlurTyping() {
// //     this.stopTypingSignal();
// //   }

// //   private async sendTypingSignal() {
// //     try {
// //       await this.typingService.startTyping(this.roomId, this.senderId);
// //       // schedule a safety stop after inactivity
// //       if (this.localTypingTimer) clearTimeout(this.localTypingTimer);
// //       this.localTypingTimer = setTimeout(() => {
// //         this.stopTypingSignal();
// //       }, 2500);
// //     } catch (err) {
// //       console.warn('startTyping failed', err);
// //     }
// //   }

// //   private async stopTypingSignal() {
// //     try {
// //       if (this.localTypingTimer) {
// //         clearTimeout(this.localTypingTimer);
// //         this.localTypingTimer = null;
// //       }
// //       await this.typingService.stopTyping(this.roomId, this.senderId);
// //     } catch (err) {
// //       console.warn('stopTyping failed', err);
// //     }
// //   }

// //   async ionViewWillEnter() {
// //     // Enable proper keyboard scrolling
// //     Keyboard.setScroll({ isDisabled: false });

// //     // Load sender (current user) details
// //     this.senderId = this.authService.authData?.userId || '';
// //     this.sender_phone = this.authService.authData?.phone_number || '';
// //     this.sender_name = this.authService.authData?.name || '';

// //     const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
// //     this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

// //     // Get query parameters
// //     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
// //     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
// //     const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

// //     // Determine chat type
// //     this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

// //     if (this.chatType === 'group') {
// //       this.roomId = decodeURIComponent(rawId);

// //       try {
// //         const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
// //         this.groupName = groupName;
// //         this.groupMembers = groupMembers;
// //       } catch (err) {
// //         console.warn('Failed to fetch group with profiles', err);
// //         this.groupName = 'Group';
// //         this.groupMembers = [];
// //       }

// //       this.setupTypingListener();
// //     } else {
// //       this.receiverId = decodeURIComponent(rawId);
// //       this.roomId = this.getRoomId(this.senderId, this.receiverId);
// //       this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
// //       localStorage.setItem('receiver_phone', this.receiver_phone);
// //     }

// //     // Reset unread count and mark messages as read
// //     await this.chatService.resetUnreadCount(this.roomId, this.senderId);
// //     await this.markMessagesAsRead();

// //     // Load and render messages
// //     this.loadFromLocalStorage();
// //     this.listenForMessages();

// //     const nav = this.router.getCurrentNavigation();
// //     const state = nav?.extras?.state;

// //     if (state && state['imageToSend']) {
// //       this.attachmentPath = state['imageToSend'];
// //     }

// //     //console.log("this.attachmentPath", this.attachmentPath);

// //     this.loadReceiverProfile();
// //   }

// //   loadReceiverProfile() {
// //     this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
// //     if (!this.receiverId) return;

// //     if (this.chatType === 'group') {
// //       this.service.getGroupDp(this.receiverId).subscribe({
// //         next: (res: any) => {
// //           this.receiverProfile = res?.group_dp_url || null;
// //         },
// //         error: (err) => {
// //           console.error("❌ Error loading group profile:", err);
// //           this.receiverProfile = null;
// //         }
// //       });
// //     } else {
// //       this.service.getUserProfilebyId(this.receiverId).subscribe({
// //         next: (res: any) => {
// //           this.receiverProfile = res?.profile || null;
// //         },
// //         error: (err) => {
// //           console.error("❌ Error loading user profile:", err);
// //           this.receiverProfile = null;
// //         }
// //       });
// //     }
// //   }

// //   setDefaultAvatar(event: Event) {
// //     (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
// //   }

// //   async openOptions(ev: any) {
// //     const popover = await this.popoverCtrl.create({
// //       component: ChatOptionsPopoverComponent,
// //       event: ev,
// //       translucent: true,
// //       componentProps: {
// //         chatType: this.chatType,
// //       },
// //     });

// //     await popover.present();

// //     const { data } = await popover.onDidDismiss();
// //     if (data?.selected) {
// //       this.handleOption(data.selected);
// //     }
// //   }

// //   async handleOption(option: string) {
// //     //console.log('Selected option:', option);

// //     if (option === 'Search') {
// //       this.showSearchBar = true;
// //       setTimeout(() => {
// //         const input = document.querySelector('ion-input');
// //         (input as HTMLIonInputElement)?.setFocus();
// //       }, 100);
// //     }

// //     if (option === 'View Contact') {
// //       const queryParams: any = {
// //         receiverId: this.receiverId,
// //         receiver_phone: this.receiver_phone,
// //         receiver_name: this.receiver_name,
// //         isGroup: false
// //       };
// //       this.router.navigate(['/profile-screen'], { queryParams });
// //     }

// //     this.route.queryParams.subscribe(params => {
// //       this.receiverId = params['receiverId'] || '';
// //     });

// //     const groupId = this.receiverId;
// //     const userId = await this.secureStorage.getItem('userId');

// //     if (option === 'Group Info') {
// //       const queryParams: any = {
// //         receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
// //         receiver_phone: this.receiver_phone,
// //         receiver_name: this.receiver_name,
// //         isGroup: this.chatType === 'group'
// //       };
// //       this.router.navigate(['/profile-screen'], { queryParams });

// //     } else if (option === 'Add Members') {
// //       const memberPhones = this.groupMembers.map(member => member.phone);
// //       this.router.navigate(['/add-members'], {
// //         queryParams: {
// //           groupId: groupId,
// //           members: JSON.stringify(memberPhones)
// //         }
// //       });

// //     } else if (option === 'Exit Group') {
// //       if (!groupId || !userId) {
// //         console.error('Missing groupId or userId');
// //         return;
// //       }

// //       const db = getDatabase();
// //       const memberPath = `groups/${groupId}/members/${userId}`;
// //       const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;

// //       try {
// //         const memberSnap = await get(ref(db, memberPath));

// //         if (!memberSnap.exists()) {
// //           console.error('Member data not found in Firebase');
// //           return;
// //         }

// //         const memberData = memberSnap.val();
// //         const updatedMemberData = {
// //           ...memberData,
// //           status: 'inactive',
// //           removedAt: new Date().toLocaleString()
// //         };

// //         await update(ref(db, memberPath), { status: 'inactive' });
// //         await set(ref(db, pastMemberPath), updatedMemberData);
// //         await remove(ref(db, memberPath));

// //         const toast = await this.toastCtrl.create({
// //           message: `You exited the group`,
// //           duration: 2000,
// //           color: 'medium'
// //         });
// //         toast.present();

// //         this.router.navigate(['/home-screen']);
// //       } catch (error) {
// //         console.error('Error exiting group:', error);
// //         const toast = await this.toastCtrl.create({
// //           message: `You exited the group`,
// //           duration: 2000,
// //           color: 'medium'
// //         });
// //         await toast.present();
// //       }
// //     }

// //   }

// //   onSearchInput() {
// //     const elements = Array.from(document.querySelectorAll('.message-text')) as HTMLElement[];

// //     elements.forEach(el => {
// //       el.innerHTML = el.textContent || '';
// //       el.style.backgroundColor = 'transparent';
// //     });

// //     if (!this.searchText.trim()) {
// //       this.matchedMessages = [];
// //       this.currentSearchIndex = -1;
// //       return;
// //     }

// //     const regex = new RegExp(`(${this.searchText})`, 'gi');

// //     this.matchedMessages = [];

// //     elements.forEach(el => {
// //       const originalText = el.textContent || '';
// //       if (regex.test(originalText)) {
// //         const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
// //         el.innerHTML = highlightedText;
// //         this.matchedMessages.push(el);
// //       }
// //     });

// //     this.currentSearchIndex = this.matchedMessages.length ? 0 : -1;

// //     if (this.currentSearchIndex >= 0) {
// //       this.matchedMessages[this.currentSearchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
// //     }
// //   }

// //   navigateSearch(direction: 'up' | 'down') {
// //     if (!this.matchedMessages.length) return;
// //     if (direction === 'up') {
// //       this.currentSearchIndex = (this.currentSearchIndex - 1 + this.matchedMessages.length) % this.matchedMessages.length;
// //     } else {
// //       this.currentSearchIndex = (this.currentSearchIndex + 1) % this.matchedMessages.length;
// //     }
// //     this.highlightMessage(this.currentSearchIndex);
// //   }

// //   highlightMessage(index: number) {
// //     this.matchedMessages.forEach(el => {
// //       const originalText = el.textContent || '';
// //       el.innerHTML = originalText;
// //       el.style.backgroundColor = 'transparent';
// //     });

// //     if (!this.searchText.trim()) return;

// //     const regex = new RegExp(`(${this.searchText})`, 'gi');

// //     this.matchedMessages.forEach((el, i) => {
// //       const originalText = el.textContent || '';
// //       const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
// //       el.innerHTML = highlightedText;
// //     });

// //     const target = this.matchedMessages[index];
// //     if (target) {
// //       target.scrollIntoView({ behavior: 'smooth', block: 'center' });
// //     }
// //   }

// //   cancelSearch() {
// //     this.searchText = '';
// //     this.showSearchBar = false;
// //     this.matchedMessages.forEach(el => {
// //       el.innerHTML = el.textContent || '';
// //       el.style.backgroundColor = 'transparent';
// //     });
// //     this.matchedMessages = [];
// //   }

// //   openPopover(ev: any) {
// //     this.popoverEvent = ev;
// //     this.showPopover = true;
// //   }

// //   onDateSelected(event: any) {
// //     const selectedDateObj = new Date(event.detail.value);

// //     const day = String(selectedDateObj.getDate()).padStart(2, '0');
// //     const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
// //     const year = selectedDateObj.getFullYear();

// //     const formattedDate = `${day}/${month}/${year}`; // Example: "11/07/2025"

// //     this.selectedDate = event.detail.value; // Original ISO format
// //     this.showPopover = false; // Close the popover
// //     this.showDateModal = false; // In case you're also using modal variant

// //     setTimeout(() => {
// //       const el = document.getElementById('date-group-' + formattedDate);
// //       if (el) {
// //         el.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //       } else {
// //         console.warn('No messages found for selected date:', formattedDate);
// //       }
// //     }, 300);
// //   }

// //   openDatePicker() {
// //     this.showDateModal = true;
// //     //console.log('Opening calendar modal...');
// //   }

// //   onMessagePress(message: any) {
// //     const index = this.selectedMessages.findIndex(m => m.key === message.key);
// //     if (index > -1) {
// //       this.selectedMessages.splice(index, 1);
// //     } else {
// //       this.selectedMessages.push(message);
// //     }
// //   }

// //   clearSelection() {
// //     this.selectedMessages = [];
// //   }

// //   private async markMessagesAsRead() {
// //     const lastMessage = this.messages[this.messages.length - 1];
// //     if (lastMessage && lastMessage.sender_id !== this.senderId) {
// //       await this.chatService.resetUnreadCount(this.roomId, this.senderId);
// //     }
// //   }

// //   startLongPress(msg: any) {
// //     this.longPressTimeout = setTimeout(() => {
// //       this.onLongPress(msg);
// //     }, 1000);
// //   }

// //   cancelLongPress() {
// //     clearTimeout(this.longPressTimeout);
// //   }

// //   onLongPress(msg: any) {
// //     this.selectedMessages = [msg];
// //     this.lastPressedMessage = msg;
// //   }

// //   onMessageClick(msg: any) {
// //     if (this.selectedMessages.length > 0) {
// //       this.toggleSelection(msg);
// //       this.lastPressedMessage = msg;
// //     }
// //   }

// //   toggleSelection(msg: any) {
// //     const index = this.selectedMessages.findIndex((m) => m.message_id === msg.message_id);
// //     if (index > -1) {
// //       this.selectedMessages.splice(index, 1);
// //     } else {
// //       this.selectedMessages.push(msg);
// //     }

// //     this.lastPressedMessage = msg;
// //   }

// //   isSelected(msg: any) {
// //     return this.selectedMessages.some((m) => m.message_id === msg.message_id);
// //   }

// //   isOnlyOneTextMessage(): boolean {
// //     return this.selectedMessages.length === 1 && this.selectedMessages[0].type === 'text';
// //   }

// //   isMultipleTextMessages(): boolean {
// //     return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type === 'text');
// //   }

// //   isOnlyOneAttachment(): boolean {
// //     return this.selectedMessages.length === 1 && this.selectedMessages[0].type !== 'text';
// //   }

// //   isMultipleAttachments(): boolean {
// //     return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type !== 'text');
// //   }

// //   isMixedSelection(): boolean {
// //     const types = this.selectedMessages.map(msg => msg.type);
// //     return types.includes('text') && types.some(t => t !== 'text');
// //   }

// //   async copySelectedMessages() {
// //     if (this.lastPressedMessage?.text) {
// //       await Clipboard.write({ string: this.lastPressedMessage.text });
// //       //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
// //       this.selectedMessages = [];
// //       this.lastPressedMessage = null;
// //     }
// //   }

// //   replyToMessages() {
// //     if (this.selectedMessages.length === 1) {
// //       const messageToReply = this.selectedMessages[0];
// //       this.setReplyToMessage(messageToReply);
// //     }
// //   }

// //   setReplyToMessage(message: Message) {
// //     this.replyToMessage = message;
// //     this.selectedMessages = [];
// //     this.lastPressedMessage = null;

// //     setTimeout(() => {
// //       const inputElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
// //       if (inputElement) {
// //         inputElement.setFocus();
// //       }
// //     }, 100);
// //   }

// //   cancelReply() {
// //     this.replyToMessage = null;
// //   }

// //   getRepliedMessage(replyToMessageId: string): Message | null {
// //     const msg = this.allMessages.find(msg => {
// //       return msg.message_id == replyToMessageId;
// //     }) || null;
// //     return msg;
// //   }

// //   getReplyPreviewText(message: Message): string {
// //     if (message.text) {
// //       return message.text.length > 50 ?
// //         message.text.substring(0, 50) + '...' :
// //         message.text;
// //     } else if (message.attachment) {
// //       const type = message.attachment.type;
// //       switch (type) {
// //         case 'image': return '📷 Photo';
// //         case 'video': return '🎥 Video';
// //         case 'audio': return '🎵 Audio';
// //         case 'file': return '📄 Document';
// //         default: return '📎 Attachment';
// //       }
// //     }
// //     return 'Message';
// //   }

// //   scrollToRepliedMessage(replyToMessageId: string) {
// //     let targetElement: HTMLElement | any;

// //     const messageElements = document.querySelectorAll('[data-msg-key]');

// //     this.allMessages.forEach((msg) => {
// //       if (msg.message_id === replyToMessageId) {
// //         const element = Array.from(messageElements).find(el =>
// //           el.getAttribute('data-msg-key') === msg.key
// //         );
// //         if (element && element instanceof HTMLElement) {
// //           targetElement = element;
// //         }
// //       }
// //     });

// //     if (targetElement) {
// //       targetElement.scrollIntoView({
// //         behavior: 'smooth',
// //         block: 'center'
// //       });

// //       targetElement.classList.add('highlight-message');
// //       setTimeout(() => {
// //         targetElement?.classList.remove('highlight-message');
// //       }, 2000);
// //     }
// //   }

// //   deleteSelectedMessages() {
// //     //console.log("selectedMessages", this.selectedMessages);
// //     this.selectedMessages.forEach(msg => {
// //       this.chatService.deleteMessage(this.roomId, msg.key);
// //     });
// //     this.selectedMessages = [];
// //   }

// //   onForward() {
// //     //console.log('Forwarding:', this.selectedMessages);

// //     this.chatService.setForwardMessages(this.selectedMessages);

// //     this.selectedMessages = [];

// //     this.router.navigate(['/forwardmessage']);
// //   }

// //   async onMore(ev?: Event) {
// //     const hasText = !!this.lastPressedMessage?.text;
// //     const hasAttachment = !!(
// //       this.lastPressedMessage?.attachment ||
// //       this.lastPressedMessage?.file ||
// //       this.lastPressedMessage?.image ||
// //       this.lastPressedMessage?.media
// //     );

// //     const isPinned = this.pinnedMessage?.key === this.lastPressedMessage?.key;

// //     const popover = await this.popoverController.create({
// //       component: MessageMorePopoverComponent,
// //       event: ev,
// //       translucent: true,
// //       showBackdrop: true,
// //       componentProps: {
// //         hasText: hasText,
// //         hasAttachment: hasAttachment,
// //         isPinned: isPinned,
// //         message: this.lastPressedMessage,
// //         currentUserId: this.senderId
// //       }
// //     });

// //     await popover.present();

// //     const { data } = await popover.onDidDismiss();
// //     if (data) {
// //       this.handlePopoverAction(data);
// //     }
// //   }

// //   async handlePopoverAction(action: string) {
// //     switch (action) {
// //       case 'info':
// //         //console.log('Info clicked');
// //         break;
// //       case 'copy':
// //         this.copyMessage();
// //         break;
// //       case 'share':
// //         this.shareMessage();
// //         break;
// //       case 'pin':
// //         this.pinMessage();
// //         break;
// //       case 'unpin':
// //         this.unpinMessage();
// //         break;
// //       case 'edit':
// //         this.editMessage(this.lastPressedMessage);
// //         break;
// //     }
// //   }

// //   async editMessage(message: Message) {
// //     const alert = await this.alertCtrl.create({
// //       header: 'Edit Message',
// //       inputs: [
// //         {
// //           name: 'text',
// //           type: 'text',
// //           value: message.text,
// //         }
// //       ],
// //       buttons: [
// //         {
// //           text: 'Cancel',
// //           role: 'cancel'
// //         },
// //         {
// //           text: 'Save',
// //           handler: async (data: any) => {
// //             if (data.text && data.text.trim() !== '') {
// //               const encryptedText = await this.encryptionService.encrypt(data.text.trim());

// //               const db = getDatabase();
// //               const msgRef = ref(db, `chats/${this.roomId}/${message.key}`);

// //               await update(msgRef, {
// //                 text: encryptedText,
// //                 isEdit: true
// //               });

// //               message.text = data.text.trim();
// //               message.isEdit = true;

// //               this.lastPressedMessage = { ...message };
// //             }
// //           }
// //         }
// //       ]
// //     });

// //     await alert.present();
// //   }

// //   async copyMessage() {
// //     if (this.lastPressedMessage?.text) {
// //       await Clipboard.write({ string: this.lastPressedMessage.text });
// //       //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
// //       this.selectedMessages = [];
// //       this.lastPressedMessage = null;
// //     }
// //   }

// //   shareMessage() {
// //     //console.log('Share clicked for attachment:', this.lastPressedMessage);
// //   }

// //   pinMessage() {
// //     const pin: PinnedMessage = {
// //       messageId: this.lastPressedMessage?.message_id as string,
// //       key: this.lastPressedMessage?.key,
// //       pinnedAt: Date.now(),
// //       pinnedBy: this.senderId,
// //       roomId: this.roomId,
// //       scope: 'global'
// //     };
// //     this.chatService.pinMessage(pin);

// //     //console.log("Message pinned", pin.messageId);
// //     this.selectedMessages = [];
// //     this.lastPressedMessage = null;
// //   }

// //   setupPinnedMessageListener() {
// //     this.pinnedMessageSubscription = this.chatService.listenToPinnedMessage(
// //       this.roomId,
// //       (pinnedMessage) => {
// //         this.pinnedMessage = pinnedMessage;
// //         if (pinnedMessage) {
// //           this.findPinnedMessageDetails(pinnedMessage.key);
// //         } else {
// //           this.pinnedMessageDetails = null;
// //         }
// //       }
// //     );
// //   }

// //   findPinnedMessageDetails(messageId: string) {
// //     for (const group of this.groupedMessages) {
// //       const foundMessage = group.messages.find(msg => msg.message_id === messageId);
// //       if (foundMessage) {
// //         this.pinnedMessageDetails = foundMessage;
// //         break;
// //       }
// //     }
// //   }

// //   unpinMessage() {
// //     if (this.pinnedMessage) {
// //       this.chatService.unpinMessage(this.roomId);
// //       this.selectedMessages = [];
// //       this.lastPressedMessage = null;
// //     }
// //   }

// //   scrollToPinnedMessage() {
// //     if (this.pinnedMessageDetails) {
// //       const element = document.querySelector(`[data-msg-key="${this.pinnedMessageDetails.key}"]`);
// //       if (element) {
// //         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
// //         element.classList.add('highlighted');
// //         setTimeout(() => element.classList.remove('highlighted'), 2000);
// //       }
// //     }
// //   }

// //   checkMobileView() {
// //     this.showMobilePinnedBanner = window.innerWidth < 480;
// //   }

// //   openChatInfo() {
// //     //console.log('Opening chat info');
// //   }

// //   async loadInitialMessages() {
// //     this.isLoadingMore = true;
// //     try {
// //       await this.loadFromLocalStorage();
// //       await this.loadMessagesFromFirebase(false);
// //     } catch (error) {
// //       console.error('Error loading initial messages:', error);
// //     } finally {
// //       this.isLoadingMore = false;
// //     }
// //   }

// //   getAttachmentIcon(type: string): string {
// //     switch (type) {
// //       case 'image': return 'image-outline';
// //       case 'video': return 'videocam-outline';
// //       case 'audio': return 'musical-note-outline';
// //       case 'file': return 'document-outline';
// //       default: return 'attach-outline';
// //     }
// //   }

// //   /**
// //    * Attach a typing listener that resolves names/avatars using this.groupMembers.
// //    * Called after groupMembers are populated by the service.
// //    */
// //   /**
// //  * Attach a typing listener that resolves names/avatars using this.groupMembers.
// //  * Works for both group and private chats.
// //  */
// // private setupTypingListener() {
// //   try {
// //     const db = getDatabase();

// //     // detach existing listener if any
// //     try { if (this.typingUnsubscribe) this.typingUnsubscribe(); } catch (e) { /* ignore */ }

// //     this.typingUnsubscribe = onValue(dbRef(db, `typing/${this.roomId}`), (snap) => {
// //       const val = snap.val() || {};
// //       const now = Date.now();

// //       const entries = Object.keys(val).map(k => ({
// //         userId: k,
// //         typing: val[k]?.typing ?? false,
// //         lastUpdated: val[k]?.lastUpdated ?? 0,
// //         name: val[k]?.name ?? null
// //       }));

// //       // recent typing entries (exclude self)
// //       const recent = entries.filter(e =>
// //         e.userId !== this.senderId &&
// //         e.typing &&
// //         (now - (e.lastUpdated || 0)) < 10000
// //       );

// //       // set the count quickly (used by your *ngIf="typingCount > 0")
// //       this.typingCount = recent.length;

// //       // If private: we only need the count (three dots). Optionally keep a single typingUsers entry.
// //       if (this.chatType === 'private') {
// //         if (recent.length === 0) {
// //           this.typingUsers = [];
// //           this.typingFrom = null;
// //           return;
// //         }

// //         // pick first typing user (there should usually be at most one in a direct chat)
// //         const other = recent[0];

// //         // Keep a minimal typingUsers entry (private template doesn't use it, but safe to have)
// //         this.typingUsers = [{
// //           userId: other.userId,
// //           name: other.name || `User ${other.userId}`,
// //           avatar: 'assets/images/default-avatar.png'
// //         }];

// //         this.typingFrom = this.typingUsers[0].name || null;
// //         return;
// //       }

// //       // -------------------------------
// //       // GROUP chat handling
// //       // -------------------------------
// //       const usersForDisplay: { userId: string; name: string | null; avatar: string | null }[] = [];

// //       recent.forEach(e => {
// //         let member = this.groupMembers.find(m => String(m.user_id) === String(e.userId));
// //         if (!member) {
// //           // fallback by phone_number if stored that way
// //           member = this.groupMembers.find(m => m.phone_number && String(m.phone_number) === String(e.userId));
// //         }

// //         const avatar = member?.avatar || null;
// //         const displayName = member?.name || e.name || e.userId;

// //         usersForDisplay.push({
// //           userId: e.userId,
// //           name: displayName,
// //           avatar: avatar || 'assets/images/default-avatar.png'
// //         });
// //       });

// //       // Deduplicate preserving order
// //       const uniq: { [k: string]: boolean } = {};
// //       this.typingUsers = usersForDisplay.filter(u => {
// //         if (uniq[u.userId]) return false;
// //         uniq[u.userId] = true;
// //         return true;
// //       });

// //       this.typingFrom = this.typingUsers.length ? this.typingUsers[0].name : null;
// //     });
// //   } catch (err) {
// //     console.warn('setupTypingListener error', err);
// //   }
// // }

// //   async ngAfterViewInit() {
// //     if (this.ionContent) {
// //       this.ionContent.ionScroll.subscribe(async (event: any) => {
// //         if (event.detail.scrollTop < 100 && this.hasMoreMessages && !this.isLoadingMore) {
// //           await this.loadMoreMessages();
// //         }
// //       });
// //     }

// //     this.setDynamicPadding();

// //     window.addEventListener('resize', this.resizeHandler);

// //     const footer = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
// //     if (footer && ('ResizeObserver' in window)) {
// //       const ro = new (window as any).ResizeObserver(() => this.setDynamicPadding());
// //       ro.observe(footer);
// //       (this as any)._ro = ro;
// //     }
// //   }

// //   async loadMoreMessages() {
// //     if (this.isLoadingMore || !this.hasMoreMessages) {
// //       return;
// //     }

// //     this.isLoadingMore = true;
// //     const currentScrollHeight = this.scrollContainer?.nativeElement?.scrollHeight || 0;

// //     try {
// //       await this.loadMessagesFromFirebase(true);

// //       setTimeout(() => {
// //         if (this.scrollContainer?.nativeElement) {
// //           const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
// //           const scrollDiff = newScrollHeight - currentScrollHeight;
// //           this.scrollContainer.nativeElement.scrollTop = scrollDiff;
// //         }
// //       }, 100);

// //     } catch (error) {
// //       console.error('Error loading more messages:', error);
// //     } finally {
// //       this.isLoadingMore = false;
// //     }
// //   }

// //   getRoomId(userA: string, userB: string): string {
// //     return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
// //   }

// //   async listenForMessages() {
// //     this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
// //       const decryptedMessages: Message[] = [];

// //       for (const msg of newMessages) {
// //         const decryptedText = await this.encryptionService.decrypt(msg.text || '');
// //         const processedMessage = { ...msg, text: decryptedText };
// //         decryptedMessages.push(processedMessage);

// //         if (msg.receiver_id === this.senderId && !msg.delivered) {
// //           this.chatService.markDelivered(this.roomId, msg.key);
// //         }
// //       }

// //       const newestDisplayedTimestamp = this.displayedMessages.length > 0
// //         ? new Date(this.displayedMessages[this.displayedMessages.length - 1].timestamp).getTime()
// //         : 0;

// //       const newIncomingMessages = decryptedMessages.filter(msg =>
// //         new Date(msg.timestamp).getTime() > newestDisplayedTimestamp
// //       );

// //       if (newIncomingMessages.length > 0) {
// //         this.allMessages = [...this.allMessages, ...newIncomingMessages];
// //         this.displayedMessages = [...this.displayedMessages, ...newIncomingMessages];

// //         this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

// //         this.saveToLocalStorage();

// //         setTimeout(() => {
// //           this.scrollToBottom();
// //           this.observeVisibleMessages();
// //         }, 100);
// //       }
// //     });
// //   }

// //   private async markDisplayedMessagesAsRead() {
// //     const unreadMessages = this.displayedMessages.filter(msg =>
// //       !msg.read && msg.receiver_id === this.senderId
// //     );

// //     for (const msg of unreadMessages) {
// //       await this.chatService.markRead(this.roomId, msg.key);
// //     }
// //   }

// //   observeVisibleMessages() {
// //     const allMessageElements = document.querySelectorAll('[data-msg-key]');

// //     allMessageElements.forEach((el: any) => {
// //       const msgKey = el.getAttribute('data-msg-key');
// //       const msgIndex = this.messages.findIndex(m => m.key === msgKey);
// //       if (msgIndex === -1) return;

// //       const msg = this.messages[msgIndex];
// //       //console.log(msg);

// //       if (!msg.read && msg.receiver_id === this.senderId) {
// //         const observer = new IntersectionObserver(entries => {
// //           entries.forEach(entry => {
// //             if (entry.isIntersecting) {
// //               this.chatService.markRead(this.roomId, msgKey);
// //               observer.unobserve(entry.target);
// //             }
// //           });
// //         }, {
// //           threshold: 1.0
// //         });

// //         observer.observe(el);
// //       }
// //     });
// //   }

// //   async groupMessagesByDate(messages: Message[]) {
// //     const grouped: { [date: string]: any[] } = {};
// //     const today = new Date();
// //     const yesterday = new Date();
// //     yesterday.setDate(today.getDate() - 1);

// //     for (const msg of messages) {
// //       const timestamp = new Date(msg.timestamp);

// //       const hours = timestamp.getHours();
// //       const minutes = timestamp.getMinutes();
// //       const ampm = hours >= 12 ? 'PM' : 'AM';
// //       const formattedHours = hours % 12 || 12;
// //       const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
// //       msg.time = `${formattedHours}:${formattedMinutes} ${ampm}`;

// //       if (msg.attachment) {
// //         const currentUserId = this.authService.authData?.userId;
// //         const receiverId = msg.receiver_id;

// //         if (receiverId === currentUserId) {
// //           try {
// //             const apiResponse = await firstValueFrom(
// //               this.service.getDownloadUrl(msg.attachment.mediaId as string)
// //             );

// //             if (apiResponse.status && apiResponse.downloadUrl) {
// //               const response = await fetch(apiResponse.downloadUrl);
// //               const blob = await response.blob();
// //               const extension = msg.attachment.fileName?.split('.').pop() || 'dat';
// //               const filename = `${msg.attachment.mediaId}.${extension}`;
// //               const file_Path = await this.FileService.saveFileToReceived(filename, blob);
// //               await this.sqliteService.saveAttachment(
// //                 this.roomId,
// //                 msg.attachment.type,
// //                 file_Path,
// //                 msg.attachment.mediaId as string
// //               );
// //             }
// //           } catch (error) {
// //             console.error("Error handling received attachment:", error);
// //           }
// //         }

// //         msg.attachment.previewUrl = await this.sqliteService.getAttachmentPreview(
// //           msg.attachment.mediaId as string
// //         );
// //       }

// //       const isToday =
// //         timestamp.getDate() === today.getDate() &&
// //         timestamp.getMonth() === today.getMonth() &&
// //         timestamp.getFullYear() === today.getFullYear();

// //       const isYesterday =
// //         timestamp.getDate() === yesterday.getDate() &&
// //         timestamp.getMonth() === yesterday.getMonth() &&
// //         timestamp.getFullYear() === yesterday.getFullYear();

// //       let label = '';
// //       if (isToday) {
// //         label = 'Today';
// //       } else if (isYesterday) {
// //         label = 'Yesterday';
// //       } else {
// //         const dd = timestamp.getDate().toString().padStart(2, '0');
// //         const mm = (timestamp.getMonth() + 1).toString().padStart(2, '0');
// //         const yyyy = timestamp.getFullYear();
// //         label = `${dd}/${mm}/${yyyy}`;
// //       }

// //       if (!grouped[label]) {
// //         grouped[label] = [];
// //       }
// //       grouped[label].push(msg);
// //     }

// //     return Object.keys(grouped).map(date => ({
// //       date,
// //       messages: grouped[date]
// //     }));
// //   }

// //   isLoadingIndicatorVisible(): boolean {
// //     return this.isLoadingMore;
// //   }

// //   async refreshMessages(event?: any) {
// //     try {
// //       this.page = 0;
// //       this.hasMoreMessages = true;
// //       this.lastMessageKey = null;
// //       this.allMessages = [];
// //       this.displayedMessages = [];

// //       await this.loadInitialMessages();

// //       if (event) {
// //         event.target.complete();
// //       }
// //     } catch (error) {
// //       console.error('Error refreshing messages:', error);
// //       if (event) {
// //         event.target.complete();
// //       }
// //     }
// //   }

// //   async loadFromLocalStorage() {
// //     const cached = localStorage.getItem(this.roomId);
// //     if (!cached) return;

// //     try {
// //       const rawMessages = JSON.parse(cached);
// //       const decryptedMessages = [];

// //       const recentMessages = rawMessages.slice(-this.limit * 3);

// //       for (const msg of recentMessages) {
// //         const decryptedText = await this.encryptionService.decrypt(msg.text || '');
// //         decryptedMessages.push({ ...msg, text: decryptedText });
// //       }

// //       this.allMessages = decryptedMessages;
// //       this.displayedMessages = decryptedMessages.slice(-this.limit);
// //       this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

// //       if (decryptedMessages.length > 0) {
// //         this.lastMessageKey = decryptedMessages[0].key;
// //       }

// //     } catch (error) {
// //       console.error('Error loading from localStorage:', error);
// //     }
// //   }

// //   blobToFile(blob: Blob, fileName: string, mimeType?: string): File {
// //     return new File([blob], fileName, {
// //       type: mimeType || blob.type,
// //       lastModified: Date.now(),
// //     });
// //   }

// //   async pickAttachment() {
// //     const result = await FilePicker.pickFiles({ readData: true });

// //     //console.log("files result of pick", result);
// //     if (result?.files?.length) {
// //       const file = result.files[0];
// //       const mimeType = file.mimeType;
// //       const type = mimeType?.startsWith('image')
// //         ? 'image'
// //         : mimeType?.startsWith('video')
// //           ? 'video'
// //           : 'file';

// //       let blob = file.blob as Blob;

// //       if (!blob && file.data) {
// //         blob = this.FileService.convertToBlob(
// //           `data:${mimeType};base64,${file.data}`,
// //           mimeType
// //         );
// //       }

// //       //console.log("blob object is ::::", blob);

// //       const previewUrl = URL.createObjectURL(blob);

// //       this.selectedAttachment = {
// //         type,
// //         blob,
// //         fileName: `${Date.now()}.${this.getFileExtension(file.name)}`,
// //         mimeType,
// //         fileSize: blob.size,
// //         previewUrl,
// //       };

// //       this.showPreviewModal = true;
// //     }
// //   }

// //   getFileExtension(fileName: string): string {
// //     const parts = fileName.split('.');
// //     return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
// //   }

// //   private async compressImage(blob: Blob): Promise<Blob> {
// //     if (!blob.type.startsWith('image/')) {
// //       return blob;
// //     }

// //     const options = {
// //       maxSizeMB: 1,
// //       maxWidthOrHeight: 1024,
// //       useWebWorker: true,
// //     };

// //     try {
// //       return await imageCompression(blob as any, options);
// //     } catch (err) {
// //       console.warn('Image compression failed:', err);
// //       return blob;
// //     }
// //   }

// //   cancelAttachment() {
// //     this.selectedAttachment = null;
// //     this.showPreviewModal = false;
// //     this.messageText = '';
// //   }

// //   setReplyTo(message: Message) {
// //     this.replyToMessage = message;
// //   }

// //   async sendMessage() {

// //     if (this.isSending) {
// //       return;
// //     }

// //     this.isSending = true;

// //     try {
// //       const plainText = this.messageText.trim();
// //       const encryptedText = plainText ? await this.encryptionService.encrypt(plainText) : '';

// //       const message: Message = {
// //         sender_id: this.senderId,
// //         text: encryptedText,
// //         timestamp: new Date().toISOString(),
// //         sender_phone: this.sender_phone,
// //         sender_name: this.sender_name,
// //         receiver_id: this.chatType === 'private' ? this.receiverId : '',
// //         receiver_phone: this.receiver_phone,
// //         delivered: false,
// //         read: false,
// //         message_id: uuidv4(),
// //         isDeleted: false,
// //         replyToMessageId: this.replyToMessage?.message_id || '',
// //         isEdit: false,
// //       };

// //       if (this.selectedAttachment) {
// //         try {
// //           const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);
// //           //console.log("media id is dfksdfgs", mediaId);

// //           message.attachment = {
// //             type: this.selectedAttachment.type,
// //             mediaId: mediaId,
// //             fileName: this.selectedAttachment.fileName,
// //             mimeType: this.selectedAttachment.mimeType,
// //             fileSize: this.selectedAttachment.fileSize,
// //             caption: plainText
// //           };

// //           const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);

// //           await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

// //         } catch (error) {
// //           console.error('Failed to upload attachment:', error);
// //           const toast = await this.toastCtrl.create({
// //             message: 'Failed to upload attachment. Please try again.',
// //             duration: 3000,
// //             color: 'danger'
// //           });
// //           await toast.present();
// //           return;
// //         }
// //       }

// //       await this.chatService.sendMessage(this.roomId, message, this.chatType, this.senderId);

// //       this.messageText = '';
// //       this.selectedAttachment = null;
// //       this.showPreviewModal = false;
// //       this.replyToMessage = null;
// //       await this.stopTypingSignal();

// //       this.scrollToBottom();

// //     } catch (error) {
// //       console.error('Error sending message:', error);
// //       const toast = await this.toastCtrl.create({
// //         message: 'Failed to send message. Please try again.',
// //         duration: 3000,
// //         color: 'danger'
// //       });
// //       await toast.present();
// //     } finally {
// //       this.isSending = false;
// //     }
// //   }

// //   private async uploadAttachmentToS3(attachment: any): Promise<string> {
// //     try {
// //       const uploadResponse = await firstValueFrom(
// //         this.service.getUploadUrl(
// //           parseInt(this.senderId),
// //           attachment.type,
// //           attachment.fileSize,
// //           attachment.mimeType,
// //           {
// //             caption: this.messageText.trim(),
// //             fileName: attachment.fileName
// //           }
// //         )
// //       );

// //       if (!uploadResponse?.status || !uploadResponse.upload_url) {
// //         throw new Error('Failed to get upload URL');
// //       }

// //       const uploadResult = await firstValueFrom(
// //         this.service.uploadToS3(uploadResponse.upload_url, this.blobToFile(attachment.blob, attachment.fileName, attachment.mimeType))
// //       );

// //       return uploadResponse.media_id;

// //     } catch (error) {
// //       console.error('S3 upload error:', error);
// //       throw error;
// //     }
// //   }

// //   async openAttachmentModal(msg: any) {
// //     if (!msg.attachment) return;

// //     let attachmentUrl = '';

// //     try {
// //       const localUrl = await this.FileService.getFilePreview(
// //         `${msg.sender_id === this.senderId ? 'sent' : 'received'}/${msg.attachment.fileName}`
// //       );

// //       if (localUrl) {
// //         attachmentUrl = localUrl;
// //       } else {
// //         const downloadResponse = await this.service.getDownloadUrl(msg.attachment.mediaId).toPromise();

// //         if (downloadResponse?.status && downloadResponse.downloadUrl) {
// //           attachmentUrl = downloadResponse.downloadUrl;

// //           if (msg.sender_id !== this.senderId) {
// //             this.downloadAndSaveLocally(downloadResponse.downloadUrl, msg.attachment.fileName);
// //           }
// //         }
// //       }

// //       const modal = await this.modalCtrl.create({
// //         component: AttachmentPreviewModalComponent,
// //         componentProps: {
// //           attachment: {
// //             ...msg.attachment,
// //             url: attachmentUrl
// //           },
// //           message: msg
// //         },
// //         cssClass: 'attachment-modal'
// //       });

// //       await modal.present();
// //       const { data } = await modal.onDidDismiss();

// //       if (data && data.action === 'reply') {
// //         this.setReplyToMessage(data.message);
// //       }

// //     } catch (error) {
// //       console.error('Failed to load attachment:', error);
// //       const toast = await this.toastCtrl.create({
// //         message: 'Failed to load attachment',
// //         duration: 2000,
// //         color: 'danger'
// //       });
// //       await toast.present();
// //     }
// //   }

// //   private async downloadAndSaveLocally(url: string, fileName: string) {
// //     try {
// //       const response = await fetch(url);
// //       const blob = await response.blob();
// //       await this.FileService.saveFileToReceived(fileName, blob);
// //     } catch (error) {
// //       console.warn('Failed to save file locally:', error);
// //     }
// //   }

// //   getAttachmentPreview(attachment: any): string {
// //     if (attachment.caption) {
// //       return attachment.caption.length > 30 ?
// //         attachment.caption.substring(0, 30) + '...' :
// //         attachment.caption;
// //     }

// //     switch (attachment.type) {
// //       case 'image': return '📷 Photo';
// //       case 'video': return '🎥 Video';
// //       case 'audio': return '🎵 Audio';
// //       case 'file': return attachment.fileName || '📄 File';
// //       default: return '📎 Attachment';
// //     }
// //   }

// //   async showAttachmentPreviewPopup() {
// //     const alert = await this.alertController.create({
// //       header: 'Send Attachment',
// //       message: this.getAttachmentPreviewHtml(),
// //       buttons: [
// //         {
// //           text: 'Cancel',
// //           role: 'cancel',
// //           handler: () => {
// //             this.selectedAttachment = null;
// //           }
// //         },
// //         {
// //           text: 'Send',
// //           handler: () => {
// //             this.sendMessage();
// //           }
// //         }
// //       ]
// //     });

// //     await alert.present();
// //   }

// //   getAttachmentPreviewHtml(): string {
// //     if (!this.selectedAttachment) return '';

// //     const { type, base64Data, fileName } = this.selectedAttachment;

// //     if (type === 'image') {
// //       return `<img src="${base64Data}" style="max-width: 100%; border-radius: 8px;" />`;
// //     } else if (type === 'video') {
// //       return `<video controls style="max-width: 100%; border-radius: 8px;">
// //               <source src="${base64Data}" type="video/mp4" />
// //             </video>`;
// //     } else if (type === 'audio') {
// //       return `<audio controls>
// //               <source src="${base64Data}" type="audio/mpeg" />
// //             </audio>`;
// //     } else {
// //       return `<p>📎 ${fileName || 'File attached'}</p>`;
// //     }
// //   }

// //   getMimeTypeFromName(name: string): string {
// //     const ext = name.split('.').pop()?.toLowerCase();
// //     switch (ext) {
// //       case 'jpg':
// //       case 'jpeg': return 'image/jpeg';
// //       case 'png': return 'image/png';
// //       case 'pdf': return 'application/pdf';
// //       case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
// //       default: return '';
// //     }
// //   }

// //   async loadMessagesFromFirebase(loadMore = false) {
// //     try {
// //       const db = getDatabase();
// //       const messagesRef = ref(db, `chats/${this.roomId}`);

// //       let qry;

// //       if (loadMore && this.lastMessageKey) {
// //         qry = query(
// //           messagesRef,
// //           orderByKey(),
// //           endBefore(this.lastMessageKey),
// //           limitToLast(this.limit)
// //         );
// //       } else {
// //         qry = query(
// //           messagesRef,
// //           orderByKey(),
// //           limitToLast(this.limit)
// //         );
// //       }

// //       const snapshot = await get(qry);

// //       if (snapshot.exists()) {
// //         const newMessages: Message[] = [];
// //         const messagesData = snapshot.val();

// //         const messageKeys = Object.keys(messagesData).sort();

// //         for (const key of messageKeys) {
// //           const msg = messagesData[key];
// //           const decryptedText = await this.encryptionService.decrypt(msg.text || '');

// //           newMessages.push({
// //             ...msg,
// //             key: key,
// //             text: decryptedText
// //           });
// //         }

// //         if (loadMore) {
// //           this.allMessages = [...newMessages, ...this.allMessages];
// //           this.displayedMessages = [...newMessages, ...this.displayedMessages];
// //         } else {
// //           this.allMessages = newMessages;
// //           this.displayedMessages = newMessages;
// //         }

// //         if (newMessages.length > 0) {
// //           if (loadMore) {
// //             this.lastMessageKey = newMessages[0].key;
// //           } else {
// //             this.lastMessageKey = newMessages[0].key;
// //           }
// //         }

// //         this.hasMoreMessages = newMessages.length === this.limit;

// //         this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

// //         this.saveToLocalStorage();

// //         await this.markDisplayedMessagesAsRead();

// //       } else {
// //         this.hasMoreMessages = false;
// //       }

// //     } catch (error) {
// //       console.error('Error loading messages from Firebase:', error);
// //     }
// //   }

// //   goToProfile() {
// //     const queryParams: any = {
// //       receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
// //       receiver_phone: this.receiver_phone,
// //       receiver_name: this.receiver_name,
// //       isGroup: this.chatType === 'group'
// //     };

// //     this.router.navigate(['/profile-screen'], { queryParams });
// //   }

// //   saveToLocalStorage() {
// //     try {
// //       const messagesToSave = this.allMessages.slice(-100);
// //       localStorage.setItem(this.roomId, JSON.stringify(messagesToSave));
// //     } catch (error) {
// //       console.error('Error saving to localStorage:', error);
// //     }
// //   }

// //   scrollToBottom() {
// //     if (this.ionContent) {
// //       setTimeout(() => {
// //         this.ionContent.scrollToBottom(300);
// //       }, 100);
// //     }
// //   }

// //   onInputChange() {
// //     this.showSendButton = this.messageText?.trim().length > 0;
// //   }

// //   onInputFocus() {
// //     this.setDynamicPadding();
// //   }

// //   onInputBlur() {
// //     this.onInputBlurTyping();
// //     this.setDynamicPadding();
// //   }

// //   goToCallingScreen() {
// //     this.router.navigate(['/calling-screen']);
// //   }

// //   async openCamera() {
// //     try {
// //       const image = await Camera.getPhoto({
// //         source: CameraSource.Camera,
// //         quality: 90,
// //         resultType: CameraResultType.Uri
// //       });
// //       this.capturedImage = image.webPath!;
// //     } catch (error) {
// //       console.error('Camera error:', error);
// //     }
// //   }

// //   openKeyboard() {
// //     setTimeout(() => {
// //       const textareaElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
// //       if (textareaElement) {
// //         textareaElement.setFocus();
// //       }
// //     }, 100);
// //   }

// //   ngOnDestroy() {
// //     this.keyboardListeners.forEach(listener => listener?.remove());
// //     this.messageSub?.unsubscribe();
// //     if (this.pinnedMessageSubscription) {
// //       this.pinnedMessageSubscription();
// //     }
// //     this.typingRxSubs.forEach(s => s.unsubscribe());
// //     try {
// //       if (this.typingUnsubscribe) this.typingUnsubscribe();
// //     } catch (e) { /* ignore */ }
// //     this.stopTypingSignal();

// //     window.removeEventListener('resize', this.resizeHandler);
// //     if ((this as any)._ro) {
// //       (this as any)._ro.disconnect();
// //     }
// //   }

// //   // -------------------------
// //   // dynamic padding logic
// //   // -------------------------
// //   private isGestureNavigation(): boolean {
// //     const screenHeight = window.screen.height || 0;
// //     const innerHeight = window.innerHeight || 0;
// //     const diff = screenHeight - innerHeight;
// //     return diff < 40;
// //   }

// //   private isTransparentButtonNav(): boolean {
// //     const screenHeight = window.screen.height || 0;
// //     const innerHeight = window.innerHeight || 0;
// //     const diff = screenHeight - innerHeight;
// //     return diff < 5;
// //   }

// //   setDynamicPadding() {
// //     const footerEl = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
// //     if (!footerEl) return;

// //     if (this.platform.is('ios')) {
// //       const safeAreaBottom = parseInt(
// //         getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')
// //       ) || 0;

// //       if (safeAreaBottom > 0) {
// //         this.renderer.setStyle(footerEl, 'padding-bottom', '16px');
// //         //console.log('chat: ✅ Gesture Navigation detected (iOS) — padding 16px');
// //       } else {
// //         this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
// //         //console.log('chat: 🔘 Buttons Navigation detected (iOS) — padding 6px');
// //       }
// //     } else {
// //       if (this.isGestureNavigation()) {
// //         this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
// //         //console.log('chat: ✅ Gesture Navigation detected (Android) — padding 35px');
// //       } else if (this.isTransparentButtonNav()) {
// //         this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
// //         //console.log('chat: ✨ Transparent Button Navigation detected (Android) — padding 35px');
// //       } else {
// //         this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
// //         //console.log('chat: 🔘 Buttons Navigation detected (Android) — padding 6px');
// //       }
// //     }
// //   }

// //   onKeyboardOrInputChange() {
// //     this.setDynamicPadding();
// //   }
// // }


// // (full imports remain as you had them)
// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   inject,
//   ViewChild,
//   ElementRef,
//   AfterViewInit,
//   QueryList,
//   Renderer2,
//   NgZone
// } from '@angular/core';
// import {
//   query,
//   orderByKey,
//   endBefore,
//   limitToLast,
//   startAfter,
//   getDatabase,
//   ref,
//   get,
//   update,
//   set,
//   remove,
//   off
// } from 'firebase/database';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AlertController, IonContent, IonicModule, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
// import { firstValueFrom, Subscription } from 'rxjs';
// import { Keyboard } from '@capacitor/keyboard';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { EncryptionService } from 'src/app/services/encryption.service';
// import { v4 as uuidv4 } from 'uuid';
// import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { FileUploadService } from '../../services/file-upload/file-upload.service';
// import { ChatOptionsPopoverComponent } from 'src/app/components/chat-options-popover/chat-options-popover.component';
// import { IonDatetime } from '@ionic/angular';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { NavController } from '@ionic/angular';
// import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';
// import { FileSystemService } from 'src/app/services/file-system.service';
// import imageCompression from 'browser-image-compression';
// import { AttachmentPreviewModalComponent } from '../../components/attachment-preview-modal/attachment-preview-modal.component';
// import { MessageMorePopoverComponent } from '../../components/message-more-popover/message-more-popover.component';
// import { Clipboard } from '@capacitor/clipboard';
// import { Message, PinnedMessage } from 'src/types';
// import { AuthService } from 'src/app/auth/auth.service';
// import { ApiService } from 'src/app/services/api/api.service';
// import { SqliteService } from 'src/app/services/sqlite.service';
// import { TypingService } from 'src/app/services/typing.service';
// import { Subject, Subscription as RxSub } from 'rxjs';
// import { throttleTime } from 'rxjs/operators';
// import { ref as dbRef, onValue, onDisconnect } from 'firebase/database';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
//   @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
//   @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
//   @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;
//   @ViewChild('longPressEl') messageElements!: QueryList<ElementRef>;

//   messages: Message[] = [];
//   groupedMessages: { date: string; messages: Message[] }[] = [];

//   messageText = '';
//   receiverId = '';
//   senderId = '';
//   sender_phone = '';
//   receiver_phone = '';
//   private messageSub?: Subscription;
//   showSendButton = false;
//   private keyboardListeners: any[] = [];
//   searchActive = false;
//   searchQuery = '';
//   searchMatches: HTMLElement[] = [];
//   currentMatchIndex = 0;
//   showSearchBar = false;
//   searchTerm = '';
//   searchText = '';
//   matchedMessages: HTMLElement[] = [];
//   currentSearchIndex = -1;
//   isDateModalOpen = false;
//   selectedDate: string = '';
//   isDatePickerOpen = false;
//   showDateModal = false;
//   selectedMessages: any[] = [];
//   imageToSend: any;
//   alertController: any;

//   private resizeHandler = () => this.setDynamicPadding();
//   private intersectionObserver?: IntersectionObserver;

//   constructor(
//     private chatService: FirebaseChatService,
//     private route: ActivatedRoute,
//     private platform: Platform,
//     private encryptionService: EncryptionService,
//     private router: Router,
//     private secureStorage: SecureStorageService,
//     private fileUploadService: FileUploadService,
//     private popoverCtrl: PopoverController,
//     private toastCtrl: ToastController,
//     private navCtrl: NavController,
//     private FileService: FileSystemService,
//     private modalCtrl: ModalController,
//     private popoverController: PopoverController,
//     private clipboard: Clipboard,
//     private authService: AuthService,
//     private service: ApiService,
//     private sqliteService: SqliteService,
//     private alertCtrl: AlertController,
//     private typingService: TypingService,
//     private renderer: Renderer2,
//     private el: ElementRef,
//     private zone: NgZone 
//   ) { }

//   roomId = '';
//   chatType: 'private' | 'group' = 'private';
//   groupName = '';
//   isGroup: any;
//   receiver_name = '';
//   sender_name = '';
//   groupMembers: {
//     user_id: string;
//     name?: string;
//     phone?: string;
//     avatar?: string;
//     role?: string;
//     phone_number?: string;
//     publicKeyHex?: string | null;
//   }[] = [];
//   attachments: any[] = [];
//   selectedAttachment: any = null;
//   showPreviewModal: boolean = false;
//   attachmentPath: string = '';
//   lastPressedMessage: any = null;
//   longPressTimeout: any;
//   replyToMessage: Message | null = null;
//   capturedImage = '';
//   pinnedMessage: PinnedMessage | null = null;
//   pinnedMessageDetails: any = null;
//   private pinnedMessageSubscription: any;
//   showMobilePinnedBanner: boolean = false;
//   chatName: string = '';
//   onlineCount: number = 0;

//   showPopover = false;
//   popoverEvent: any;
//   isSending = false;

//   limit = 15; // Load 15 messages at a time
//   page = 0;
//   isLoadingMore = false;
//   hasMoreMessages = true;
//   allMessages: Message[] = []; // Store all messages
//   displayedMessages: Message[] = []; // Messages currently shown
//   private lastMessageKey: string | null = null;

//   receiverProfile: string | null = null;

// // block state flags
// iBlocked = false;       // I blocked them
// theyBlocked = false;    // They blocked me

// // UI bubbles
// showBlockBubble = false;
// showUnblockBubble = false;
// private blockBubbleTimeout: any = null;

// // refs for listeners (so we can off them)
// private iBlockedRef: any = null;
// private theyBlockedRef: any = null;
// private _iBlockedLoaded = false;
// private _theyBlockedLoaded = false;


//   // --- Typing indicator related ---
//   private typingInput$ = new Subject<void>();
//   private typingRxSubs: RxSub[] = [];   // rx subscriptions for typing throttling
//   typingCount = 0;                      // number of other users typing
//   typingFrom: string | null = null;     // single user name who is typing
//   private localTypingTimer: any = null; // inactivity timer to auto stop typing
//   private typingUnsubscribe: (() => void) | null = null; // to stop onValue listener
//   typingUsers: { userId: string; name: string | null; avatar: string | null }[] = [];

//   async ngOnInit() {
//     // Enable proper keyboard scrolling
//     Keyboard.setScroll({ isDisabled: false });

//     // Load sender (current user) details
//     this.senderId = this.authService.authData?.userId || '';
//     this.sender_phone = this.authService.authData?.phone_number || '';
//     this.sender_name = this.authService.authData?.name || '';

//     const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
//     this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

//     // Get query parameters
//     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
//     const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

//     // Determine chat type
//     this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

//     if (this.chatType === 'group') {
//       // Group chat
//       this.roomId = decodeURIComponent(rawId);

//       // Use service to fetch group name + enriched members (profiles)
//       try {
//         const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
//         this.groupName = groupName;
//         this.groupMembers = groupMembers;
//       } catch (err) {
//         console.warn('Failed to fetch group with profiles', err);
//         this.groupName = 'Group';
//         this.groupMembers = [];
//       }
//     } else {
//       // Individual chat
//       this.receiverId = decodeURIComponent(rawId);
//       this.roomId = this.getRoomId(this.senderId, this.receiverId);

//       // Use receiver_phone from query or fallback to localStorage
//       this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
//       // Store for reuse when navigating to profile
//       localStorage.setItem('receiver_phone', this.receiver_phone);
//     }

//     // IMPORTANT: attach typing listener for BOTH group and private now
//     this.setupTypingListener();


//     // Reset unread count and mark messages as read
//     await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//     await this.markMessagesAsRead();

//     try {
//       const db = getDatabase();

//       // Setup onDisconnect removal for safety
//       try {
//         const myTypingRef = dbRef(db, `typing/${this.roomId}/${this.senderId}`);
//         onDisconnect(myTypingRef).remove();
//       } catch (err) {
//         // ignore if not supported
//         console.warn('onDisconnect setup failed', err);
//       }

//       // Outgoing typing: throttle DB writes
//       const tsub = this.typingInput$.pipe(
//         throttleTime(1200, undefined, { leading: true, trailing: true })
//       ).subscribe(() => {
//         this.sendTypingSignal();
//       });
//       this.typingRxSubs.push(tsub);
//     } catch (err) {
//       console.warn('Typing setup error', err);
//     }

//     // Load and render messages
//     this.loadFromLocalStorage();
//     this.listenForMessages();
//     this.setupPinnedMessageListener();

//     this.checkMobileView();

//     // Scroll to bottom after short delay
//     setTimeout(() => this.scrollToBottom(), 100);

//     await this.loadInitialMessages();
//     this.loadReceiverProfile();
//     await this.checkIfBlocked();
//   }

//   onInputTyping() {
//     // keep existing showSendButton logic
//     this.onInputChange();

//     // notify subject to throttle outgoing typing updates
//     this.typingInput$.next();

//     // reset local timer
//     if (this.localTypingTimer) {
//       clearTimeout(this.localTypingTimer);
//     }
//     this.localTypingTimer = setTimeout(() => {
//       this.stopTypingSignal();
//     }, 2500);
//   }

//   // call on blur to ensure immediate stop
//   onInputBlurTyping() {
//     this.stopTypingSignal();
//   }

//   private async sendTypingSignal() {
//     try {
//       await this.typingService.startTyping(this.roomId, this.senderId);
//       // schedule a safety stop after inactivity
//       if (this.localTypingTimer) clearTimeout(this.localTypingTimer);
//       this.localTypingTimer = setTimeout(() => {
//         this.stopTypingSignal();
//       }, 2500);
//     } catch (err) {
//       console.warn('startTyping failed', err);
//     }
//   }

//   private async stopTypingSignal() {
//     try {
//       if (this.localTypingTimer) {
//         clearTimeout(this.localTypingTimer);
//         this.localTypingTimer = null;
//       }
//       await this.typingService.stopTyping(this.roomId, this.senderId);
//     } catch (err) {
//       console.warn('stopTyping failed', err);
//     }
//   }

//   async ionViewWillEnter() {
//     // Enable proper keyboard scrolling
//     Keyboard.setScroll({ isDisabled: false });

//     // Load sender (current user) details
//     this.senderId = this.authService.authData?.userId || '';
//     this.sender_phone = this.authService.authData?.phone_number || '';
//     this.sender_name = this.authService.authData?.name || '';

//     const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
//     this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

//     // Get query parameters
//     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
//     const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

//     // Determine chat type
//     this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

//     if (this.chatType === 'group') {
//       this.roomId = decodeURIComponent(rawId);

//       try {
//         const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
//         this.groupName = groupName;
//         this.groupMembers = groupMembers;
//       } catch (err) {
//         console.warn('Failed to fetch group with profiles', err);
//         this.groupName = 'Group';
//         this.groupMembers = [];
//       }

//       this.setupTypingListener();
//     } else {
//       this.receiverId = decodeURIComponent(rawId);
//       this.roomId = this.getRoomId(this.senderId, this.receiverId);
//       this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
//       localStorage.setItem('receiver_phone', this.receiver_phone);
//     }

//     // Reset unread count and mark messages as read
//     await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//     await this.markMessagesAsRead();

//     // Load and render messages
//     this.loadFromLocalStorage();
//     this.listenForMessages();

//     const nav = this.router.getCurrentNavigation();
//     const state = nav?.extras?.state;

//     if (state && state['imageToSend']) {
//       this.attachmentPath = state['imageToSend'];
//     }

//     //console.log("this.attachmentPath", this.attachmentPath);

//     this.loadReceiverProfile();
//   }

//   loadReceiverProfile() {
//     this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     if (!this.receiverId) return;

//     if (this.chatType === 'group') {
//       this.service.getGroupDp(this.receiverId).subscribe({
//         next: (res: any) => {
//           this.receiverProfile = res?.group_dp_url || null;
//         },
//         error: (err) => {
//           console.error("❌ Error loading group profile:", err);
//           this.receiverProfile = null;
//         }
//       });
//     } else {
//       this.service.getUserProfilebyId(this.receiverId).subscribe({
//         next: (res: any) => {
//           this.receiverProfile = res?.profile || null;
//         },
//         error: (err) => {
//           console.error("❌ Error loading user profile:", err);
//           this.receiverProfile = null;
//         }
//       });
//     }
//   }

//   setDefaultAvatar(event: Event) {
//     (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
//   }

//   async openOptions(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: ChatOptionsPopoverComponent,
//       event: ev,
//       translucent: true,
//       componentProps: {
//         chatType: this.chatType,
//       },
//     });

//     await popover.present();

//     const { data } = await popover.onDidDismiss();
//     if (data?.selected) {
//       this.handleOption(data.selected);
//     }
//   }

//   // goBacktohome(){
//   //   this.router.navigate(['/home-screen']);
//   // }

//   async handleOption(option: string) {
//     //console.log('Selected option:', option);

//     if (option === 'Search') {
//       this.showSearchBar = true;
//       setTimeout(() => {
//         const input = document.querySelector('ion-input');
//         (input as HTMLIonInputElement)?.setFocus();
//       }, 100);
//     }

//     if (option === 'View Contact') {
//       const queryParams: any = {
//         receiverId: this.receiverId,
//         receiver_phone: this.receiver_phone,
//         receiver_name: this.receiver_name,
//         isGroup: false
//       };
//       this.router.navigate(['/profile-screen'], { queryParams });
//     }

//     this.route.queryParams.subscribe(params => {
//       this.receiverId = params['receiverId'] || '';
//     });

//     const groupId = this.receiverId;
//     const userId = await this.secureStorage.getItem('userId');

//     if (option === 'Group Info') {
//       const queryParams: any = {
//         receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
//         receiver_phone: this.receiver_phone,
//         receiver_name: this.receiver_name,
//         isGroup: this.chatType === 'group'
//       };
//       this.router.navigate(['/profile-screen'], { queryParams });

//     } else if (option === 'Add Members') {
//       const memberPhones = this.groupMembers.map(member => member.phone);
//       this.router.navigate(['/add-members'], {
//         queryParams: {
//           groupId: groupId,
//           members: JSON.stringify(memberPhones)
//         }
//       });

//     } else if (option === 'Exit Group') {
//       if (!groupId || !userId) {
//         console.error('Missing groupId or userId');
//         return;
//       }

//       const db = getDatabase();
//       const memberPath = `groups/${groupId}/members/${userId}`;
//       const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;

//       try {
//         const memberSnap = await get(ref(db, memberPath));

//         if (!memberSnap.exists()) {
//           console.error('Member data not found in Firebase');
//           return;
//         }

//         const memberData = memberSnap.val();
//         const updatedMemberData = {
//           ...memberData,
//           status: 'inactive',
//           removedAt: new Date().toLocaleString()
//         };

//         await update(ref(db, memberPath), { status: 'inactive' });
//         await set(ref(db, pastMemberPath), updatedMemberData);
//         await remove(ref(db, memberPath));

//         const toast = await this.toastCtrl.create({
//           message: `You exited the group`,
//           duration: 2000,
//           color: 'medium'
//         });
//         toast.present();

//         this.router.navigate(['/home-screen']);
//       } catch (error) {
//         console.error('Error exiting group:', error);
//         const toast = await this.toastCtrl.create({
//           message: `You exited the group`,
//           duration: 2000,
//           color: 'medium'
//         });
//         await toast.present();
//       }
//     }

//   }

// async checkIfBlocked() {
//   // ensure senderId/receiverId exist
//   this.senderId = this.authService.authData?.userId || this.senderId;
//   if (!this.senderId || !this.receiverId) return;

//   const db = getDatabase();

//   // detach any old listeners
//   try {
//     if (this.iBlockedRef) off(this.iBlockedRef);
//     if (this.theyBlockedRef) off(this.theyBlockedRef);
//   } catch (e) { /* ignore */ }

//   this.iBlockedRef = ref(db, `blockedContacts/${this.senderId}/${this.receiverId}`);
//   this.theyBlockedRef = ref(db, `blockedContacts/${this.receiverId}/${this.senderId}`);

//   onValue(this.iBlockedRef, (snap) => {
//     const exists = snap.exists();
//     this.zone.run(() => {
//       // If this is not the first load and state changed -> show system bubble
//       if (this._iBlockedLoaded && exists !== this.iBlocked) {
//         if (exists) {
//           // show "You blocked..." bubble until user unblocks or navigate away
//           clearTimeout(this.blockBubbleTimeout);
//           this.showBlockBubble = true;
//           this.showUnblockBubble = false;
//           // scroll to bottom to make bubble visible
//           setTimeout(() => this.scrollToBottom(), 120);
//         } else {
//           // show "You unblocked..." bubble briefly
//           this.showBlockBubble = false;
//           this.showUnblockBubble = true;
//           clearTimeout(this.blockBubbleTimeout);
//           this.blockBubbleTimeout = setTimeout(() => {
//             this.showUnblockBubble = false;
//           }, 3000);
//         }
//       }
//       this.iBlocked = exists;
//       this._iBlockedLoaded = true;
//     });
//   });

//   onValue(this.theyBlockedRef, (snap) => {
//     const exists = snap.exists();
//     this.zone.run(() => {
//       // optional: show small toast for "they blocked you" events (not necessary)
//       this.theyBlocked = exists;
//       this._theyBlockedLoaded = true;
//     });
//   });
// }
// async unblockFromChat() {
//   try {
//     const db = getDatabase();
//     await remove(ref(db, `blockedContacts/${this.senderId}/${this.receiverId}`));
//     // show local unblocked bubble (listener will also update states)
//     this.showBlockBubble = false;
//     this.showUnblockBubble = true;
//     clearTimeout(this.blockBubbleTimeout);
//     this.blockBubbleTimeout = setTimeout(() => { this.showUnblockBubble = false; }, 3000);
//   } catch (err) {
//     console.error('Unblock failed', err);
//     const t = await this.toastCtrl.create({ message: 'Failed to unblock', duration: 2000, color: 'danger' });
//     t.present();
//   }
// }

// async deleteChat() {
//   try {
//     // remove chat messages from RTDB (dangerous: use only if you want server-side delete)
//     const db = getDatabase();
//     await remove(ref(db, `chats/${this.roomId}`));
//     // also clear local caches
//     localStorage.removeItem(this.roomId);
//     const t = await this.toastCtrl.create({ message: 'Chat deleted', duration: 1500, color: 'danger' });
//     t.present();
//     // navigate back to home
//     setTimeout(() => this.router.navigate(['/home-screen']), 800);
//   } catch (err) {
//     console.error('deleteChat failed', err);
//     const t = await this.toastCtrl.create({ message: 'Failed to delete chat', duration: 2000, color: 'danger' });
//     t.present();
//   }
// }




//   onSearchInput() {
//     const elements = Array.from(document.querySelectorAll('.message-text')) as HTMLElement[];

//     elements.forEach(el => {
//       el.innerHTML = el.textContent || '';
//       el.style.backgroundColor = 'transparent';
//     });

//     if (!this.searchText.trim()) {
//       this.matchedMessages = [];
//       this.currentSearchIndex = -1;
//       return;
//     }

//     const regex = new RegExp(`(${this.searchText})`, 'gi');

//     this.matchedMessages = [];

//     elements.forEach(el => {
//       const originalText = el.textContent || '';
//       if (regex.test(originalText)) {
//         const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
//         el.innerHTML = highlightedText;
//         this.matchedMessages.push(el);
//       }
//     });

//     this.currentSearchIndex = this.matchedMessages.length ? 0 : -1;

//     if (this.currentSearchIndex >= 0) {
//       this.matchedMessages[this.currentSearchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }

//   navigateSearch(direction: 'up' | 'down') {
//     if (!this.matchedMessages.length) return;
//     if (direction === 'up') {
//       this.currentSearchIndex = (this.currentSearchIndex - 1 + this.matchedMessages.length) % this.matchedMessages.length;
//     } else {
//       this.currentSearchIndex = (this.currentSearchIndex + 1) % this.matchedMessages.length;
//     }
//     this.highlightMessage(this.currentSearchIndex);
//   }

//   highlightMessage(index: number) {
//     this.matchedMessages.forEach(el => {
//       const originalText = el.textContent || '';
//       el.innerHTML = originalText;
//       el.style.backgroundColor = 'transparent';
//     });

//     if (!this.searchText.trim()) return;

//     const regex = new RegExp(`(${this.searchText})`, 'gi');

//     this.matchedMessages.forEach((el, i) => {
//       const originalText = el.textContent || '';
//       const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
//       el.innerHTML = highlightedText;
//     });

//     const target = this.matchedMessages[index];
//     if (target) {
//       target.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }

//   cancelSearch() {
//     this.searchText = '';
//     this.showSearchBar = false;
//     this.matchedMessages.forEach(el => {
//       el.innerHTML = el.textContent || '';
//       el.style.backgroundColor = 'transparent';
//     });
//     this.matchedMessages = [];
//   }

//   openPopover(ev: any) {
//     this.popoverEvent = ev;
//     this.showPopover = true;
//   }

//   onDateSelected(event: any) {
//     const selectedDateObj = new Date(event.detail.value);

//     const day = String(selectedDateObj.getDate()).padStart(2, '0');
//     const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
//     const year = selectedDateObj.getFullYear();

//     const formattedDate = `${day}/${month}/${year}`; // Example: "11/07/2025"

//     this.selectedDate = event.detail.value; // Original ISO format
//     this.showPopover = false; // Close the popover
//     this.showDateModal = false; // In case you're also using modal variant

//     setTimeout(() => {
//       const el = document.getElementById('date-group-' + formattedDate);
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       } else {
//         console.warn('No messages found for selected date:', formattedDate);
//       }
//     }, 300);
//   }

//   openDatePicker() {
//     this.showDateModal = true;
//     //console.log('Opening calendar modal...');
//   }

//   onMessagePress(message: any) {
//     const index = this.selectedMessages.findIndex(m => m.key === message.key);
//     if (index > -1) {
//       this.selectedMessages.splice(index, 1);
//     } else {
//       this.selectedMessages.push(message);
//     }
//   }

//   clearSelection() {
//     this.selectedMessages = [];
//   }

//   private async markMessagesAsRead() {
//     const lastMessage = this.messages[this.messages.length - 1];
//     if (lastMessage && lastMessage.sender_id !== this.senderId) {
//       await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//     }
//   }

//   startLongPress(msg: any) {
//     this.longPressTimeout = setTimeout(() => {
//       this.onLongPress(msg);
//     }, 1000);
//   }

//   cancelLongPress() {
//     clearTimeout(this.longPressTimeout);
//   }

//   onLongPress(msg: any) {
//     this.selectedMessages = [msg];
//     this.lastPressedMessage = msg;
//   }

//   onMessageClick(msg: any) {
//     if (this.selectedMessages.length > 0) {
//       this.toggleSelection(msg);
//       this.lastPressedMessage = msg;
//     }
//   }

//   toggleSelection(msg: any) {
//     const index = this.selectedMessages.findIndex((m) => m.message_id === msg.message_id);
//     if (index > -1) {
//       this.selectedMessages.splice(index, 1);
//     } else {
//       this.selectedMessages.push(msg);
//     }

//     this.lastPressedMessage = msg;
//   }

//   isSelected(msg: any) {
//     return this.selectedMessages.some((m) => m.message_id === msg.message_id);
//   }

//   isOnlyOneTextMessage(): boolean {
//     return this.selectedMessages.length === 1 && this.selectedMessages[0].type === 'text';
//   }

//   isMultipleTextMessages(): boolean {
//     return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type === 'text');
//   }

//   isOnlyOneAttachment(): boolean {
//     return this.selectedMessages.length === 1 && this.selectedMessages[0].type !== 'text';
//   }

//   isMultipleAttachments(): boolean {
//     return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type !== 'text');
//   }

//   isMixedSelection(): boolean {
//     const types = this.selectedMessages.map(msg => msg.type);
//     return types.includes('text') && types.some(t => t !== 'text');
//   }

//   async copySelectedMessages() {
//     if (this.lastPressedMessage?.text) {
//       await Clipboard.write({ string: this.lastPressedMessage.text });
//       //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
//       this.selectedMessages = [];
//       this.lastPressedMessage = null;
//     }
//   }

//   replyToMessages() {
//     if (this.selectedMessages.length === 1) {
//       const messageToReply = this.selectedMessages[0];
//       this.setReplyToMessage(messageToReply);
//     }
//   }

//   setReplyToMessage(message: Message) {
//     this.replyToMessage = message;
//     this.selectedMessages = [];
//     this.lastPressedMessage = null;

//     setTimeout(() => {
//       const inputElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
//       if (inputElement) {
//         inputElement.setFocus();
//       }
//     }, 100);
//   }

//   cancelReply() {
//     this.replyToMessage = null;
//   }

//   getRepliedMessage(replyToMessageId: string): Message | null {
//     const msg = this.allMessages.find(msg => {
//       return msg.message_id == replyToMessageId;
//     }) || null;
//     return msg;
//   }

//   getReplyPreviewText(message: Message): string {
//     if (message.text) {
//       return message.text.length > 50 ?
//         message.text.substring(0, 50) + '...' :
//         message.text;
//     } else if (message.attachment) {
//       const type = message.attachment.type;
//       switch (type) {
//         case 'image': return '📷 Photo';
//         case 'video': return '🎥 Video';
//         case 'audio': return '🎵 Audio';
//         case 'file': return '📄 Document';
//         default: return '📎 Attachment';
//       }
//     }
//     return 'Message';
//   }

//   scrollToRepliedMessage(replyToMessageId: string) {
//     let targetElement: HTMLElement | any;

//     const messageElements = document.querySelectorAll('[data-msg-key]');

//     this.allMessages.forEach((msg) => {
//       if (msg.message_id === replyToMessageId) {
//         const element = Array.from(messageElements).find(el =>
//           el.getAttribute('data-msg-key') === msg.key
//         );
//         if (element && element instanceof HTMLElement) {
//           targetElement = element;
//         }
//       }
//     });

//     if (targetElement) {
//       targetElement.scrollIntoView({
//         behavior: 'smooth',
//         block: 'center'
//       });

//       targetElement.classList.add('highlight-message');
//       setTimeout(() => {
//         targetElement?.classList.remove('highlight-message');
//       }, 2000);
//     }
//   }

//   deleteSelectedMessages() {
//     //console.log("selectedMessages", this.selectedMessages);
//     this.selectedMessages.forEach(msg => {
//       this.chatService.deleteMessage(this.roomId, msg.key);
//     });
//     this.selectedMessages = [];
//   }

//   onForward() {
//     //console.log('Forwarding:', this.selectedMessages);

//     this.chatService.setForwardMessages(this.selectedMessages);

//     this.selectedMessages = [];

//     this.router.navigate(['/forwardmessage']);
//   }

//   async onMore(ev?: Event) {
//     const hasText = !!this.lastPressedMessage?.text;
//     const hasAttachment = !!(
//       this.lastPressedMessage?.attachment ||
//       this.lastPressedMessage?.file ||
//       this.lastPressedMessage?.image ||
//       this.lastPressedMessage?.media
//     );

//     const isPinned = this.pinnedMessage?.key === this.lastPressedMessage?.key;

//     const popover = await this.popoverController.create({
//       component: MessageMorePopoverComponent,
//       event: ev,
//       translucent: true,
//       showBackdrop: true,
//       componentProps: {
//         hasText: hasText,
//         hasAttachment: hasAttachment,
//         isPinned: isPinned,
//         message: this.lastPressedMessage,
//         currentUserId: this.senderId
//       }
//     });

//     await popover.present();

//     const { data } = await popover.onDidDismiss();
//     if (data) {
//       this.handlePopoverAction(data);
//     }
//   }

//   async handlePopoverAction(action: string) {
//     switch (action) {
//       case 'info':
//         //console.log('Info clicked');
//         break;
//       case 'copy':
//         this.copyMessage();
//         break;
//       case 'share':
//         this.shareMessage();
//         break;
//       case 'pin':
//         this.pinMessage();
//         break;
//       case 'unpin':
//         this.unpinMessage();
//         break;
//       case 'edit':
//         this.editMessage(this.lastPressedMessage);
//         break;
//     }
//   }

//   async editMessage(message: Message) {
//     const alert = await this.alertCtrl.create({
//       header: 'Edit Message',
//       inputs: [
//         {
//           name: 'text',
//           type: 'text',
//           value: message.text,
//         }
//       ],
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel'
//         },
//         {
//           text: 'Save',
//           handler: async (data: any) => {
//             if (data.text && data.text.trim() !== '') {
//               const encryptedText = await this.encryptionService.encrypt(data.text.trim());

//               const db = getDatabase();
//               const msgRef = ref(db, `chats/${this.roomId}/${message.key}`);

//               await update(msgRef, {
//                 text: encryptedText,
//                 isEdit: true
//               });

//               message.text = data.text.trim();
//               message.isEdit = true;

//               this.lastPressedMessage = { ...message };
//             }
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }

//   async copyMessage() {
//     if (this.lastPressedMessage?.text) {
//       await Clipboard.write({ string: this.lastPressedMessage.text });
//       //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
//       this.selectedMessages = [];
//       this.lastPressedMessage = null;
//     }
//   }

//   shareMessage() {
//     //console.log('Share clicked for attachment:', this.lastPressedMessage);
//   }

//   pinMessage() {
//     const pin: PinnedMessage = {
//       messageId: this.lastPressedMessage?.message_id as string,
//       key: this.lastPressedMessage?.key,
//       pinnedAt: Date.now(),
//       pinnedBy: this.senderId,
//       roomId: this.roomId,
//       scope: 'global'
//     };
//     this.chatService.pinMessage(pin);

//     //console.log("Message pinned", pin.messageId);
//     this.selectedMessages = [];
//     this.lastPressedMessage = null;
//   }

//   setupPinnedMessageListener() {
//     this.pinnedMessageSubscription = this.chatService.listenToPinnedMessage(
//       this.roomId,
//       (pinnedMessage) => {
//         this.pinnedMessage = pinnedMessage;
//         if (pinnedMessage) {
//           this.findPinnedMessageDetails(pinnedMessage.key);
//         } else {
//           this.pinnedMessageDetails = null;
//         }
//       }
//     );
//   }

//   findPinnedMessageDetails(messageId: string) {
//     for (const group of this.groupedMessages) {
//       const foundMessage = group.messages.find(msg => msg.message_id === messageId);
//       if (foundMessage) {
//         this.pinnedMessageDetails = foundMessage;
//         break;
//       }
//     }
//   }

//   unpinMessage() {
//     if (this.pinnedMessage) {
//       this.chatService.unpinMessage(this.roomId);
//       this.selectedMessages = [];
//       this.lastPressedMessage = null;
//     }
//   }

//   scrollToPinnedMessage() {
//     if (this.pinnedMessageDetails) {
//       const element = document.querySelector(`[data-msg-key="${this.pinnedMessageDetails.key}"]`);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         element.classList.add('highlighted');
//         setTimeout(() => element.classList.remove('highlighted'), 2000);
//       }
//     }
//   }

//   checkMobileView() {
//     this.showMobilePinnedBanner = window.innerWidth < 480;
//   }

//   openChatInfo() {
//     //console.log('Opening chat info');
//   }

//   async loadInitialMessages() {
//     this.isLoadingMore = true;
//     try {
//       await this.loadFromLocalStorage();
//       await this.loadMessagesFromFirebase(false);
//     } catch (error) {
//       console.error('Error loading initial messages:', error);
//     } finally {
//       this.isLoadingMore = false;
//     }
//   }

//   getAttachmentIcon(type: string): string {
//     switch (type) {
//       case 'image': return 'image-outline';
//       case 'video': return 'videocam-outline';
//       case 'audio': return 'musical-note-outline';
//       case 'file': return 'document-outline';
//       default: return 'attach-outline';
//     }
//   }

//   /**
//    * Attach a typing listener that resolves names/avatars using this.groupMembers.
//    * Called after groupMembers are populated by the service.
//    */
//   /**
//  * Attach a typing listener that resolves names/avatars using this.groupMembers.
//  * Works for both group and private chats.
//  */
// private setupTypingListener() {
//   try {
//     const db = getDatabase();

//     // detach existing listener if any
//     try { if (this.typingUnsubscribe) this.typingUnsubscribe(); } catch (e) { /* ignore */ }

//     this.typingUnsubscribe = onValue(dbRef(db, `typing/${this.roomId}`), (snap) => {
//       const val = snap.val() || {};
//       const now = Date.now();

//       const entries = Object.keys(val).map(k => ({
//         userId: k,
//         typing: val[k]?.typing ?? false,
//         lastUpdated: val[k]?.lastUpdated ?? 0,
//         name: val[k]?.name ?? null
//       }));

//       // recent typing entries (exclude self)
//       const recent = entries.filter(e =>
//         e.userId !== this.senderId &&
//         e.typing &&
//         (now - (e.lastUpdated || 0)) < 10000
//       );

//       // set the count quickly (used by your *ngIf="typingCount > 0")
//       this.typingCount = recent.length;

//       // If private: we only need the count (three dots). Optionally keep a single typingUsers entry.
//       if (this.chatType === 'private') {
//         if (recent.length === 0) {
//           this.typingUsers = [];
//           this.typingFrom = null;
//           return;
//         }

//         // pick first typing user (there should usually be at most one in a direct chat)
//         const other = recent[0];

//         // Keep a minimal typingUsers entry (private template doesn't use it, but safe to have)
//         this.typingUsers = [{
//           userId: other.userId,
//           name: other.name || `User ${other.userId}`,
//           avatar: 'assets/images/default-avatar.png'
//         }];

//         this.typingFrom = this.typingUsers[0].name || null;
//         return;
//       }

//       // -------------------------------
//       // GROUP chat handling
//       // -------------------------------
//       const usersForDisplay: { userId: string; name: string | null; avatar: string | null }[] = [];

//       recent.forEach(e => {
//         let member = this.groupMembers.find(m => String(m.user_id) === String(e.userId));
//         if (!member) {
//           // fallback by phone_number if stored that way
//           member = this.groupMembers.find(m => m.phone_number && String(m.phone_number) === String(e.userId));
//         }

//         const avatar = member?.avatar || null;
//         const displayName = member?.name || e.name || e.userId;

//         usersForDisplay.push({
//           userId: e.userId,
//           name: displayName,
//           avatar: avatar || 'assets/images/default-avatar.png'
//         });
//       });

//       // Deduplicate preserving order
//       const uniq: { [k: string]: boolean } = {};
//       this.typingUsers = usersForDisplay.filter(u => {
//         if (uniq[u.userId]) return false;
//         uniq[u.userId] = true;
//         return true;
//       });

//       this.typingFrom = this.typingUsers.length ? this.typingUsers[0].name : null;
//     });
//   } catch (err) {
//     console.warn('setupTypingListener error', err);
//   }
// }

//   async ngAfterViewInit() {
//     if (this.ionContent) {
//       this.ionContent.ionScroll.subscribe(async (event: any) => {
//         if (event.detail.scrollTop < 100 && this.hasMoreMessages && !this.isLoadingMore) {
//           await this.loadMoreMessages();
//         }
//       });
//     }

//     this.setDynamicPadding();

//     window.addEventListener('resize', this.resizeHandler);

//     const footer = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
//     if (footer && ('ResizeObserver' in window)) {
//       const ro = new (window as any).ResizeObserver(() => this.setDynamicPadding());
//       ro.observe(footer);
//       (this as any)._ro = ro;
//     }
//   }

//   async loadMoreMessages() {
//     if (this.isLoadingMore || !this.hasMoreMessages) {
//       return;
//     }

//     this.isLoadingMore = true;
//     const currentScrollHeight = this.scrollContainer?.nativeElement?.scrollHeight || 0;

//     try {
//       await this.loadMessagesFromFirebase(true);

//       setTimeout(() => {
//         if (this.scrollContainer?.nativeElement) {
//           const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
//           const scrollDiff = newScrollHeight - currentScrollHeight;
//           this.scrollContainer.nativeElement.scrollTop = scrollDiff;
//         }
//       }, 100);

//     } catch (error) {
//       console.error('Error loading more messages:', error);
//     } finally {
//       this.isLoadingMore = false;
//     }
//   }

//   getRoomId(userA: string, userB: string): string {
//     return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
//   }

//   // ---------- MAIN FIX: improved listener that MERGES updates ----------
//   // async listenForMessages() {
//   //   // unsubscribe existing
//   //   this.messageSub?.unsubscribe();

//   //   this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
//   //     if (!Array.isArray(newMessages)) return;

//   //     const decryptedMessages: Message[] = [];

//   //     // decrypt all incoming messages
//   //     for (const msg of newMessages) {
//   //       const decryptedText = await this.encryptionService.decrypt(msg.text || '');
//   //       const processedMessage = { ...msg, text: decryptedText };
//   //       decryptedMessages.push(processedMessage);

//   //       // If the message is addressed to me and not yet delivered, mark delivered immediately
//   //       if (msg.receiver_id === this.senderId && !msg.delivered) {
//   //         try {
//   //           this.chatService.markDelivered(this.roomId, msg.key);
//   //         } catch (err) {
//   //           console.warn('markDelivered failed', err);
//   //         }
//   //       }
//   //     }

//   //     // MERGE decryptedMessages into this.allMessages by key
//   //     const existingMap: Record<string, Message> = {};
//   //     this.allMessages.forEach(m => { if (m.key) existingMap[m.key] = m; });

//   //     decryptedMessages.forEach(async dm => {
//   //       if (!dm.key) return;
//   //       const existing = existingMap[dm.key];
//   //       if (existing) {
//   //         // update only changed props to preserve any client-side fields
//   //         existing.text = dm.text;
//   //         existing.timestamp = dm.timestamp;
//   //         existing.sender_id = dm.sender_id;
//   //         existing.sender_name = dm.sender_name;
//   //         existing.sender_phone = dm.sender_phone;
//   //         existing.receiver_id = dm.receiver_id;
//   //         existing.receiver_phone = dm.receiver_phone;
//   //         existing.attachment = dm.attachment;
//   //         existing.delivered = dm.delivered;
//   //         existing.read = dm.read;
//   //         existing.isDeleted = dm.isDeleted;
//   //         existing.isEdit = dm.isEdit;
//   //         existing.replyToMessageId = dm.replyToMessageId;
//   //         // ... copy any other fields present
//   //       } else {
//   //         this.allMessages.push({ ...dm });
//   //       }

//   //       // If this message is to me and the chat is open, proactively mark read (so read flag propagates in realtime)
//   //       if (dm.receiver_id === this.senderId && !dm.read) {
//   //         try {
//   //           // mark read in DB (this will cause the onValue to emit again with read=true)
//   //           await this.chatService.markRead(this.roomId, dm.key);

//   //           // reset unreadCounts for this room & user
//   //           await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//   //         } catch (err) {
//   //           console.warn('markRead/resetUnreadCount failed', err);
//   //         }
//   //       }
//   //     });

//   //     // Sort allMessages by timestamp ascending to maintain order
//   //     this.allMessages.sort((a, b) => {
//   //       const ta = new Date(a.timestamp).getTime();
//   //       const tb = new Date(b.timestamp).getTime();
//   //       return ta - tb;
//   //     });

//   //     // Update displayedMessages (keep last N)
//   //     const startIdx = Math.max(0, this.allMessages.length - Math.max(this.limit, this.displayedMessages.length || this.limit));
//   //     this.displayedMessages = this.allMessages.slice(startIdx);

//   //     // Rebuild grouped messages for UI
//   //     this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//   //     // persist to localStorage
//   //     this.saveToLocalStorage();

//   //     // Optional: update any UI decorators (e.g., pinned message details) after new data
//   //     if (this.pinnedMessage) {
//   //       this.findPinnedMessageDetails(this.pinnedMessage.key);
//   //     }

//   //     // small delay to allow UI update then scroll if newest message belongs to this chat
//   //     setTimeout(() => {
//   //       this.scrollToBottom();
//   //       this.observeVisibleMessages();
//   //     }, 100);
//   //   });
//   // }

//   async listenForMessages() {
//   // unsubscribe existing
//   this.messageSub?.unsubscribe();

//   this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
//     if (!Array.isArray(newMessages)) return;

//     // Step 1 — decrypt sequentially (so we can act immediately for each message)
//     const decryptedMessages: Message[] = [];
//     for (const msg of newMessages) {
//       const decryptedText = await this.encryptionService.decrypt(msg.text || '');
//       const processedMessage: Message = { ...msg, text: decryptedText };
//       decryptedMessages.push(processedMessage);

//       // If the message is addressed to me and not yet delivered, mark delivered immediately (await it)
//       if (msg.receiver_id === this.senderId && !msg.delivered) {
//         try {
//           // await to avoid racing repeated writes
//           await this.chatService.markDelivered(this.roomId, msg.key);
//         } catch (err) {
//           console.warn('markDelivered failed', err);
//         }
//       }
//     }

//     // Build map of existing messages by key for quick lookup
//     const existingIndexMap: Record<string, number> = {};
//     this.allMessages.forEach((m, i) => { if (m.key) existingIndexMap[m.key] = i; });

//     // Step 2 — merge updates, using for..of so awaits inside are respected
//     for (const dm of decryptedMessages) {
//       if (!dm.key) continue;
//       const idx = existingIndexMap[dm.key];

//       if (idx !== undefined) {
//         // Replace object entirely (preserve client-side fields if you want - copy them in)
//         // Example: preserve any local-only flags from old object
//         const old = this.allMessages[idx];
//         const merged: Message = {
//           ...old,
//           ...dm,             // remote wins for normal fields
//           // keep any local-only fields from old (if present)
//           // e.g., isLocallyEdited: old.isLocallyEdited ?? dm.isLocallyEdited
//         };
//         this.allMessages[idx] = merged;
//       } else {
//         // new message — push a fresh object
//         this.allMessages.push({ ...dm });
//       }

//       // If message is to me and the chat is open, proactively mark read (await it)
//       // //console.log("dm.receiver_id , this.senderId && dm.read",dm.receiver_id,this.senderId, dm.read);
//       if (dm.receiver_id === this.senderId && !dm.read) {
//         try {
//           await this.chatService.markRead(this.roomId, dm.key);
//           await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//         } catch (err) {
//           console.warn('markRead/resetUnreadCount failed', err);
//         }
//       }
//     }

//     // Step 3 — sort messages by timestamp (safe numeric compare; guard invalid dates)
//     this.allMessages.sort((a, b) => {
//       const ta = Number(a.timestamp) || new Date(a.timestamp || 0).getTime();
//       const tb = Number(b.timestamp) || new Date(b.timestamp || 0).getTime();
//       return ta - tb;
//     });

//     // Step 4 — update displayedMessages: keep last N messages (or current displayed count if that is larger)
//     const keepCount = Math.max(this.limit || 50, this.displayedMessages?.length || 0); // keep at least `limit`
//     const startIdx = Math.max(0, this.allMessages.length - keepCount);
//     this.displayedMessages = this.allMessages.slice(startIdx);

//     // Step 5 — rebuild grouped messages for UI
//     this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//     // Step 6 — persist
//     this.saveToLocalStorage();

//     // Optional pinned message refresh
//     if (this.pinnedMessage) {
//       this.findPinnedMessageDetails(this.pinnedMessage.key);
//     }

//     // Ensure change detection and then scroll. If using OnPush, you may need detectChanges()
//     // allow the microtask queue to finish first
//     await Promise.resolve();
//     this.scrollToBottom();
//     this.observeVisibleMessages();
//   });
// }


//   private async markDisplayedMessagesAsRead() {
//     const unreadMessages = this.displayedMessages.filter(msg =>
//       !msg.read && msg.receiver_id === this.senderId
//     );

//     for (const msg of unreadMessages) {
//       await this.chatService.markRead(this.roomId, msg.key);
//     }
//   }

//   observeVisibleMessages() {
//     const allMessageElements = document.querySelectorAll('[data-msg-key]');

//     allMessageElements.forEach((el: any) => {
//       const msgKey = el.getAttribute('data-msg-key');
//       const msgIndex = this.displayedMessages.findIndex(m => m.key === msgKey);
//       if (msgIndex === -1) return;

//       const msg = this.displayedMessages[msgIndex];

//       if (!msg.read && msg.receiver_id === this.senderId) {
//         const observer = new IntersectionObserver(entries => {
//           entries.forEach(entry => {
//             if (entry.isIntersecting) {
//               this.chatService.markRead(this.roomId, msgKey);
//               observer.unobserve(entry.target);
//             }
//           });
//         }, {
//           threshold: 1.0
//         });

//         observer.observe(el);
//       }
//     });
//   }

//   async groupMessagesByDate(messages: Message[]) {
//     const grouped: { [date: string]: any[] } = {};
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     for (const msg of messages) {
//       const timestamp = new Date(msg.timestamp);

//       const hours = timestamp.getHours();
//       const minutes = timestamp.getMinutes();
//       const ampm = hours >= 12 ? 'PM' : 'AM';
//       const formattedHours = hours % 12 || 12;
//       const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
//       msg.time = `${formattedHours}:${formattedMinutes} ${ampm}`;

//       if (msg.attachment) {
//         const currentUserId = this.authService.authData?.userId;
//         const receiverId = msg.receiver_id;

//         if (receiverId === currentUserId) {
//           try {
//             const apiResponse = await firstValueFrom(
//               this.service.getDownloadUrl(msg.attachment.mediaId as string)
//             );

//             if (apiResponse.status && apiResponse.downloadUrl) {
//               const response = await fetch(apiResponse.downloadUrl);
//               const blob = await response.blob();
//               const extension = msg.attachment.fileName?.split('.').pop() || 'dat';
//               const filename = `${msg.attachment.mediaId}.${extension}`;
//               const file_Path = await this.FileService.saveFileToReceived(filename, blob);
//               await this.sqliteService.saveAttachment(
//                 this.roomId,
//                 msg.attachment.type,
//                 file_Path,
//                 msg.attachment.mediaId as string
//               );
//             }
//           } catch (error) {
//             console.error("Error handling received attachment:", error);
//           }
//         }

//         msg.attachment.previewUrl = await this.sqliteService.getAttachmentPreview(
//           msg.attachment.mediaId as string
//         );
//       }

//       const isToday =
//         timestamp.getDate() === today.getDate() &&
//         timestamp.getMonth() === today.getMonth() &&
//         timestamp.getFullYear() === today.getFullYear();

//       const isYesterday =
//         timestamp.getDate() === yesterday.getDate() &&
//         timestamp.getMonth() === yesterday.getMonth() &&
//         timestamp.getFullYear() === yesterday.getFullYear();

//       let label = '';
//       if (isToday) {
//         label = 'Today';
//       } else if (isYesterday) {
//         label = 'Yesterday';
//       } else {
//         const dd = timestamp.getDate().toString().padStart(2, '0');
//         const mm = (timestamp.getMonth() + 1).toString().padStart(2, '0');
//         const yyyy = timestamp.getFullYear();
//         label = `${dd}/${mm}/${yyyy}`;
//       }

//       if (!grouped[label]) {
//         grouped[label] = [];
//       }
//       grouped[label].push(msg);
//     }

//     return Object.keys(grouped).map(date => ({
//       date,
//       messages: grouped[date]
//     }));
//   }

//   isLoadingIndicatorVisible(): boolean {
//     return this.isLoadingMore;
//   }

//   async refreshMessages(event?: any) {
//     try {
//       this.page = 0;
//       this.hasMoreMessages = true;
//       this.lastMessageKey = null;
//       this.allMessages = [];
//       this.displayedMessages = [];

//       await this.loadInitialMessages();

//       if (event) {
//         event.target.complete();
//       }
//     } catch (error) {
//       console.error('Error refreshing messages:', error);
//       if (event) {
//         event.target.complete();
//       }
//     }
//   }

//   async loadFromLocalStorage() {
//     const cached = localStorage.getItem(this.roomId);
//     if (!cached) return;

//     try {
//       const rawMessages = JSON.parse(cached);
//       const decryptedMessages = [];

//       const recentMessages = rawMessages.slice(-this.limit * 3);

//       for (const msg of recentMessages) {
//         const decryptedText = await this.encryptionService.decrypt(msg.text || '');
//         decryptedMessages.push({ ...msg, text: decryptedText });
//       }

//       this.allMessages = decryptedMessages;
//       this.displayedMessages = decryptedMessages.slice(-this.limit);
//       this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//       if (decryptedMessages.length > 0) {
//         this.lastMessageKey = decryptedMessages[0].key;
//       }

//     } catch (error) {
//       console.error('Error loading from localStorage:', error);
//     }
//   }

//   blobToFile(blob: Blob, fileName: string, mimeType?: string): File {
//     return new File([blob], fileName, {
//       type: mimeType || blob.type,
//       lastModified: Date.now(),
//     });
//   }

//   async pickAttachment() {
//     const result = await FilePicker.pickFiles({ readData: true });

//     //console.log("files result of pick", result);
//     if (result?.files?.length) {
//       const file = result.files[0];
//       const mimeType = file.mimeType;
//       const type = mimeType?.startsWith('image')
//         ? 'image'
//         : mimeType?.startsWith('video')
//           ? 'video'
//           : 'file';

//       let blob = file.blob as Blob;

//       if (!blob && file.data) {
//         blob = this.FileService.convertToBlob(
//           `data:${mimeType};base64,${file.data}`,
//           mimeType
//         );
//       }

//       //console.log("blob object is ::::", blob);

//       const previewUrl = URL.createObjectURL(blob);

//       this.selectedAttachment = {
//         type,
//         blob,
//         fileName: `${Date.now()}.${this.getFileExtension(file.name)}`,
//         mimeType,
//         fileSize: blob.size,
//         previewUrl,
//       };

//       this.showPreviewModal = true;
//     }
//   }

//   getFileExtension(fileName: string): string {
//     const parts = fileName.split('.');
//     return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
//   }

//   private async compressImage(blob: Blob): Promise<Blob> {
//     if (!blob.type.startsWith('image/')) {
//       return blob;
//     }

//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1024,
//       useWebWorker: true,
//     };

//     try {
//       return await imageCompression(blob as any, options);
//     } catch (err) {
//       console.warn('Image compression failed:', err);
//       return blob;
//     }
//   }

//   cancelAttachment() {
//     this.selectedAttachment = null;
//     this.showPreviewModal = false;
//     this.messageText = '';
//   }

//   setReplyTo(message: Message) {
//     this.replyToMessage = message;
//   }

// //   async sendMessage() {

// //     if (this.iBlocked) {
// //   const toast = await this.toastCtrl.create({ message: `Unblock ${this.receiver_name} to send messages.`, duration: 1800, color: 'medium' });
// //   await toast.present();
// //   return;
// // }
// // if (this.theyBlocked) {
// //   const toast = await this.toastCtrl.create({ message: `You cannot send messages — ${this.receiver_name} has blocked you.`, duration: 2200, color: 'warning' });
// //   await toast.present();
// //   return;
// // }

// //     if (this.isSending) {
// //       return;
// //     }

// //     this.isSending = true;

// //     try {
// //       const plainText = this.messageText.trim();
// //       const encryptedText = plainText ? await this.encryptionService.encrypt(plainText) : '';

// //       const message: Message = {
// //         sender_id: this.senderId,
// //         text: encryptedText,
// //         timestamp: new Date().toISOString(),
// //         sender_phone: this.sender_phone,
// //         sender_name: this.sender_name,
// //         receiver_id: this.chatType === 'private' ? this.receiverId : '',
// //         receiver_phone: this.receiver_phone,
// //         delivered: false,
// //         read: false,
// //         message_id: uuidv4(),
// //         isDeleted: false,
// //         replyToMessageId: this.replyToMessage?.message_id || '',
// //         isEdit: false,
// //       };

// //       if (this.selectedAttachment) {
// //         try {
// //           const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);
// //           //console.log("media id is dfksdfgs", mediaId);

// //           message.attachment = {
// //             type: this.selectedAttachment.type,
// //             mediaId: mediaId,
// //             fileName: this.selectedAttachment.fileName,
// //             mimeType: this.selectedAttachment.mimeType,
// //             fileSize: this.selectedAttachment.fileSize,
// //             caption: plainText
// //           };

// //           const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);

// //           await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

// //         } catch (error) {
// //           console.error('Failed to upload attachment:', error);
// //           const toast = await this.toastCtrl.create({
// //             message: 'Failed to upload attachment. Please try again.',
// //             duration: 3000,
// //             color: 'danger'
// //           });
// //           await toast.present();
// //           return;
// //         }
// //       }

// //       await this.chatService.sendMessage(this.roomId, message, this.chatType, this.senderId);

// //       this.messageText = '';
// //       this.selectedAttachment = null;
// //       this.showPreviewModal = false;
// //       this.replyToMessage = null;
// //       await this.stopTypingSignal();

// //       this.scrollToBottom();

// //     } catch (error) {
// //       console.error('Error sending message:', error);
// //       const toast = await this.toastCtrl.create({
// //         message: 'Failed to send message. Please try again.',
// //         duration: 3000,
// //         color: 'danger'
// //       });
// //       await toast.present();
// //     } finally {
// //       this.isSending = false;
// //     }
// //   }

// async sendMessage() {
//   if (this.isSending) return;

//   // if *I* blocked them, don't allow sending
//   if (this.iBlocked) {
//     const toast = await this.toastCtrl.create({ message: `Unblock ${this.receiver_name} to send messages.`, duration: 1800, color: 'medium' });
//     await toast.present();
//     return;
//   }

//   this.isSending = true;

//   try {
//     const plainText = this.messageText.trim();

//     // Build a local message structure for UI
//     const localKey = uuidv4();
//     const localMessage: any = {
//       sender_id: this.senderId,
//       text: plainText,
//       timestamp: new Date().toISOString(),
//       sender_phone: this.sender_phone,
//       sender_name: this.sender_name,
//       receiver_id: this.chatType === 'private' ? this.receiverId : '',
//       receiver_phone: this.receiver_phone,
//       delivered: false, // single tick on sender side
//       read: false,
//       message_id: uuidv4(),
//       isDeleted: false,
//       replyToMessageId: this.replyToMessage?.message_id || '',
//       isEdit: false,
//       localOnly: false,
//       key: localKey
//     };

//     // If THEY have blocked ME -> save locally and DO NOT send to server
//     if (this.theyBlocked) {
//       localMessage.localOnly = true;

//       if (this.selectedAttachment) {
//         // save attachment locally; do NOT upload to server
//         try {
//           const filename = this.selectedAttachment.fileName || `${Date.now()}.${this.getFileExtension(this.selectedAttachment.fileName || 'dat')}`;
//           // save file into your "sent" folder (FileService.saveFileToSent should return path or void)
//           await this.FileService.saveFileToSent(filename, this.selectedAttachment.blob);

//           // use empty string for mediaId (not null) to satisfy sqliteService signature
//           localMessage.attachment = {
//             type: this.selectedAttachment.type,
//             mediaId: '',
//             fileName: filename,
//             mimeType: this.selectedAttachment.mimeType,
//             fileSize: this.selectedAttachment.fileSize,
//             caption: plainText,
//             previewUrl: URL.createObjectURL(this.selectedAttachment.blob)
//           };

//           // Save metadata into sqlite; pass empty string for mediaId
//           try {
//             await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, `sent/${filename}`, '');
//           } catch (e) {
//             // non-fatal: log but continue (we still show message locally)
//             console.warn('sqlite saveAttachment (local) failed', e);
//           }
//         } catch (err) {
//           console.warn('Failed to save attachment locally:', err);
//         }
//       }

//       // add to local arrays & UI
//       this.allMessages.push({ ...localMessage });
//       this.allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

//       const startIdx = Math.max(0, this.allMessages.length - Math.max(this.limit, this.displayedMessages.length || this.limit));
//       this.displayedMessages = this.allMessages.slice(startIdx);
//       this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//       this.saveToLocalStorage();

//       // clear UI state
//       this.messageText = '';
//       this.selectedAttachment = null;
//       this.showPreviewModal = false;
//       this.replyToMessage = null;
//       await this.stopTypingSignal();
//       this.scrollToBottom();
//       return; // do not send to server, never retry
//     }

//     // Normal path - they haven't blocked me: encrypt / upload attachments / send to server
//     const encryptedText = plainText ? await this.encryptionService.encrypt(plainText) : '';

//     const serverMessage: Message = {
//       sender_id: this.senderId,
//       text: encryptedText,
//       timestamp: new Date().toISOString(),
//       sender_phone: this.sender_phone,
//       sender_name: this.sender_name,
//       receiver_id: this.chatType === 'private' ? this.receiverId : '',
//       receiver_phone: this.receiver_phone,
//       delivered: false,
//       read: false,
//       message_id: uuidv4(),
//       isDeleted: false,
//       replyToMessageId: this.replyToMessage?.message_id || '',
//       isEdit: false
//     };

//     if (this.selectedAttachment) {
//       try {
//         const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);
//         serverMessage.attachment = {
//           type: this.selectedAttachment.type,
//           mediaId: mediaId,
//           fileName: this.selectedAttachment.fileName,
//           mimeType: this.selectedAttachment.mimeType,
//           fileSize: this.selectedAttachment.fileSize,
//           caption: plainText
//         };

//         const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);
//         await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

//       } catch (error) {
//         console.error('Failed to upload attachment:', error);
//         const toast = await this.toastCtrl.create({
//           message: 'Failed to upload attachment. Please try again.',
//           duration: 3000,
//           color: 'danger'
//         });
//         await toast.present();
//         return;
//       }
//     }

//     await this.chatService.sendMessage(this.roomId, serverMessage, this.chatType, this.senderId);

//     // clear UI states
//     this.messageText = '';
//     this.selectedAttachment = null;
//     this.showPreviewModal = false;
//     this.replyToMessage = null;
//     await this.stopTypingSignal();
//     this.scrollToBottom();

//   } catch (error) {
//     console.error('Error sending message:', error);
//     const toast = await this.toastCtrl.create({ message: 'Failed to send message. Please try again.', duration: 3000, color: 'danger' });
//     await toast.present();
//   } finally {
//     this.isSending = false;
//   }
// }


//   private async uploadAttachmentToS3(attachment: any): Promise<string> {
//     try {
//       const uploadResponse = await firstValueFrom(
//         this.service.getUploadUrl(
//           parseInt(this.senderId),
//           attachment.type,
//           attachment.fileSize,
//           attachment.mimeType,
//           {
//             caption: this.messageText.trim(),
//             fileName: attachment.fileName
//           }
//         )
//       );

//       if (!uploadResponse?.status || !uploadResponse.upload_url) {
//         throw new Error('Failed to get upload URL');
//       }

//       const uploadResult = await firstValueFrom(
//         this.service.uploadToS3(uploadResponse.upload_url, this.blobToFile(attachment.blob, attachment.fileName, attachment.mimeType))
//       );

//       return uploadResponse.media_id;

//     } catch (error) {
//       console.error('S3 upload error:', error);
//       throw error;
//     }
//   }

//   async openAttachmentModal(msg: any) {
//     if (!msg.attachment) return;

//     let attachmentUrl = '';

//     try {
//       const localUrl = await this.FileService.getFilePreview(
//         `${msg.sender_id === this.senderId ? 'sent' : 'received'}/${msg.attachment.fileName}`
//       );

//       if (localUrl) {
//         attachmentUrl = localUrl;
//       } else {
//         const downloadResponse = await this.service.getDownloadUrl(msg.attachment.mediaId).toPromise();

//         if (downloadResponse?.status && downloadResponse.downloadUrl) {
//           attachmentUrl = downloadResponse.downloadUrl;

//           if (msg.sender_id !== this.senderId) {
//             this.downloadAndSaveLocally(downloadResponse.downloadUrl, msg.attachment.fileName);
//           }
//         }
//       }

//       const modal = await this.modalCtrl.create({
//         component: AttachmentPreviewModalComponent,
//         componentProps: {
//           attachment: {
//             ...msg.attachment,
//             url: attachmentUrl
//           },
//           message: msg
//         },
//         cssClass: 'attachment-modal'
//       });

//       await modal.present();
//       const { data } = await modal.onDidDismiss();

//       if (data && data.action === 'reply') {
//         this.setReplyToMessage(data.message);
//       }

//     } catch (error) {
//       console.error('Failed to load attachment:', error);
//       const toast = await this.toastCtrl.create({
//         message: 'Failed to load attachment',
//         duration: 2000,
//         color: 'danger'
//       });
//       await toast.present();
//     }
//   }

//   private async downloadAndSaveLocally(url: string, fileName: string) {
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       await this.FileService.saveFileToReceived(fileName, blob);
//     } catch (error) {
//       console.warn('Failed to save file locally:', error);
//     }
//   }

//   getAttachmentPreview(attachment: any): string {
//     if (attachment.caption) {
//       return attachment.caption.length > 30 ?
//         attachment.caption.substring(0, 30) + '...' :
//         attachment.caption;
//     }

//     switch (attachment.type) {
//       case 'image': return '📷 Photo';
//       case 'video': return '🎥 Video';
//       case 'audio': return '🎵 Audio';
//       case 'file': return attachment.fileName || '📄 File';
//       default: return '📎 Attachment';
//     }
//   }

//   async showAttachmentPreviewPopup() {
//     const alert = await this.alertController.create({
//       header: 'Send Attachment',
//       message: this.getAttachmentPreviewHtml(),
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel',
//           handler: () => {
//             this.selectedAttachment = null;
//           }
//         },
//         {
//           text: 'Send',
//           handler: () => {
//             this.sendMessage();
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }

//   getAttachmentPreviewHtml(): string {
//     if (!this.selectedAttachment) return '';

//     const { type, base64Data, fileName } = this.selectedAttachment;

//     if (type === 'image') {
//       return `<img src="${base64Data}" style="max-width: 100%; border-radius: 8px;" />`;
//     } else if (type === 'video') {
//       return `<video controls style="max-width: 100%; border-radius: 8px;">
//               <source src="${base64Data}" type="video/mp4" />
//             </video>`;
//     } else if (type === 'audio') {
//       return `<audio controls>
//               <source src="${base64Data}" type="audio/mpeg" />
//             </audio>`;
//     } else {
//       return `<p>📎 ${fileName || 'File attached'}</p>`;
//     }
//   }

//   getMimeTypeFromName(name: string): string {
//     const ext = name.split('.').pop()?.toLowerCase();
//     switch (ext) {
//       case 'jpg':
//       case 'jpeg': return 'image/jpeg';
//       case 'png': return 'image/png';
//       case 'pdf': return 'application/pdf';
//       case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//       default: return '';
//     }
//   }

//   async loadMessagesFromFirebase(loadMore = false) {
//     try {
//       const db = getDatabase();
//       const messagesRef = ref(db, `chats/${this.roomId}`);

//       let qry;

//       if (loadMore && this.lastMessageKey) {
//         qry = query(
//           messagesRef,
//           orderByKey(),
//           endBefore(this.lastMessageKey),
//           limitToLast(this.limit)
//         );
//       } else {
//         qry = query(
//           messagesRef,
//           orderByKey(),
//           limitToLast(this.limit)
//         );
//       }

//       const snapshot = await get(qry);

//       if (snapshot.exists()) {
//         const newMessages: Message[] = [];
//         const messagesData = snapshot.val();

//         const messageKeys = Object.keys(messagesData).sort();

//         for (const key of messageKeys) {
//           const msg = messagesData[key];
//           const decryptedText = await this.encryptionService.decrypt(msg.text || '');

//           newMessages.push({
//             ...msg,
//             key: key,
//             text: decryptedText
//           });
//         }

//         if (loadMore) {
//           this.allMessages = [...newMessages, ...this.allMessages];
//           this.displayedMessages = [...newMessages, ...this.displayedMessages];
//         } else {
//           this.allMessages = newMessages;
//           this.displayedMessages = newMessages;
//         }

//         if (newMessages.length > 0) {
//           if (loadMore) {
//             this.lastMessageKey = newMessages[0].key;
//           } else {
//             this.lastMessageKey = newMessages[0].key;
//           }
//         }

//         this.hasMoreMessages = newMessages.length === this.limit;

//         this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//         this.saveToLocalStorage();

//         await this.markDisplayedMessagesAsRead();

//       } else {
//         this.hasMoreMessages = false;
//       }

//     } catch (error) {
//       console.error('Error loading messages from Firebase:', error);
//     }
//   }

//   goToProfile() {
//     const queryParams: any = {
//       receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
//       receiver_phone: this.receiver_phone,
//       receiver_name: this.receiver_name,
//       isGroup: this.chatType === 'group'
//     };

//     this.router.navigate(['/profile-screen'], { queryParams });
//   }

//   saveToLocalStorage() {
//     try {
//       const messagesToSave = this.allMessages.slice(-100);
//       localStorage.setItem(this.roomId, JSON.stringify(messagesToSave));
//     } catch (error) {
//       console.error('Error saving to localStorage:', error);
//     }
//   }

//   scrollToBottom() {
//     if (this.ionContent) {
//       setTimeout(() => {
//         this.ionContent.scrollToBottom(300);
//       }, 100);
//     }
//   }

//   onInputChange() {
//     this.showSendButton = this.messageText?.trim().length > 0;
//   }

//   onInputFocus() {
//     this.setDynamicPadding();
//   }

//   onInputBlur() {
//     this.onInputBlurTyping();
//     this.setDynamicPadding();
//   }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   async openCamera() {
//     try {
//       const image = await Camera.getPhoto({
//         source: CameraSource.Camera,
//         quality: 90,
//         resultType: CameraResultType.Uri
//       });
//       this.capturedImage = image.webPath!;
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   }

//   openKeyboard() {
//     setTimeout(() => {
//       const textareaElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
//       if (textareaElement) {
//         textareaElement.setFocus();
//       }
//     }, 100);
//   }

//   ngOnDestroy() {
//     this.keyboardListeners.forEach(listener => listener?.remove());
//     this.messageSub?.unsubscribe();
//     if (this.pinnedMessageSubscription) {
//       this.pinnedMessageSubscription();
//     }
//     this.typingRxSubs.forEach(s => s.unsubscribe());
//     try {
//       if (this.typingUnsubscribe) this.typingUnsubscribe();
//     } catch (e) { /* ignore */ }
//     this.stopTypingSignal();

//     window.removeEventListener('resize', this.resizeHandler);
//     if ((this as any)._ro) {
//       (this as any)._ro.disconnect();
//     }

//     try {
//   if (this.iBlockedRef) off(this.iBlockedRef);
//   if (this.theyBlockedRef) off(this.theyBlockedRef);
//   clearTimeout(this.blockBubbleTimeout);
// } catch (e) { /* ignore */ }

//   }

//   // -------------------------
//   // dynamic padding logic
//   // -------------------------
//   private isGestureNavigation(): boolean {
//     const screenHeight = window.screen.height || 0;
//     const innerHeight = window.innerHeight || 0;
//     const diff = screenHeight - innerHeight;
//     return diff < 40;
//   }

//   private isTransparentButtonNav(): boolean {
//     const screenHeight = window.screen.height || 0;
//     const innerHeight = window.innerHeight || 0;
//     const diff = screenHeight - innerHeight;
//     return diff < 5;
//   }

//   setDynamicPadding() {
//     const footerEl = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
//     if (!footerEl) return;

//     if (this.platform.is('ios')) {
//       const safeAreaBottom = parseInt(
//         getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')
//       ) || 0;

//       if (safeAreaBottom > 0) {
//         this.renderer.setStyle(footerEl, 'padding-bottom', '16px');
//         //console.log('chat: ✅ Gesture Navigation detected (iOS) — padding 16px');
//       } else {
//         this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
//         //console.log('chat: 🔘 Buttons Navigation detected (iOS) — padding 6px');
//       }
//     } else {
//       if (this.isGestureNavigation()) {
//         this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
//         //console.log('chat: ✅ Gesture Navigation detected (Android) — padding 35px');
//       } else if (this.isTransparentButtonNav()) {
//         this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
//         //console.log('chat: ✨ Transparent Button Navigation detected (Android) — padding 35px');
//       } else {
//         this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
//         //console.log('chat: 🔘 Buttons Navigation detected (Android) — padding 6px');
//       }
//     }
//   }

//   onKeyboardOrInputChange() {
//     this.setDynamicPadding();
//   }
// }


import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  QueryList,
  Renderer2,
  NgZone
} from '@angular/core';
import {
  query,
  orderByKey,
  endBefore,
  limitToLast,
  getDatabase,
  ref,
  get,
  update,
  set,
  remove,
  off
} from 'firebase/database';
import { ref as dbRef, onValue, onDisconnect } from 'firebase/database';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonContent,
  IonicModule,
  ModalController,
  Platform,
  PopoverController,
  ToastController,
  IonDatetime
} from '@ionic/angular';
import { firstValueFrom, Subscription, timer } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { v4 as uuidv4 } from 'uuid';
import { SecureStorageService } from '../../../services/secure-storage/secure-storage.service';
import { FileUploadService } from '../../../services/file-upload/file-upload.service';
import { ChatOptionsPopoverComponent } from 'src/app/components/chat-options-popover/chat-options-popover.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { FileSystemService } from 'src/app/services/file-system.service';
import imageCompression from 'browser-image-compression';
import { AttachmentPreviewModalComponent } from '../../../components/attachment-preview-modal/attachment-preview-modal.component';
import { MessageMorePopoverComponent } from '../../../components/message-more-popover/message-more-popover.component';
import { Clipboard } from '@capacitor/clipboard';
import { Message, PinnedMessage } from 'src/types';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import { SqliteService } from 'src/app/services/sqlite.service';
import { TypingService } from 'src/app/services/typing.service';
import { Subject, Subscription as RxSub } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { PresenceService } from 'src/app/services/presence.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-community-chat',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './community-chat.page.html',
  styleUrls: ['./community-chat.page.scss']
})
export class CommunityChatPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;
  @ViewChild('longPressEl') messageElements!: QueryList<ElementRef>;

  messages: Message[] = [];
  groupedMessages: { date: string; messages: Message[] }[] = [];

  messageText = '';
  receiverId = '';
  senderId = '';
  sender_phone = '';
  receiver_phone = '';
  private messageSub?: Subscription;
  showSendButton = false;
  private keyboardListeners: any[] = [];
  searchActive = false;
  searchQuery = '';
  searchMatches: HTMLElement[] = [];
  currentMatchIndex = 0;
  showSearchBar = false;
  searchTerm = '';
  searchText = '';
  matchedMessages: HTMLElement[] = [];
  currentSearchIndex = -1;
  isDateModalOpen = false;
  selectedDate: string = '';
  isDatePickerOpen = false;
  showDateModal = false;
  selectedMessages: any[] = [];
  imageToSend: any;
  alertController: any;

  private resizeHandler = () => this.setDynamicPadding();
  private intersectionObserver?: IntersectionObserver;

  roomId = '';
  chatType: 'private' | 'group' = 'private';
  groupName = '';
  isGroup: any;
  receiver_name = '';
  sender_name = '';
  groupMembers: {
    user_id: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    phone_number?: string;
    publicKeyHex?: string | null;
  }[] = [];
  attachments: any[] = [];
  selectedAttachment: any = null;
  showPreviewModal: boolean = false;
  attachmentPath: string = '';
  lastPressedMessage: any = null;
  longPressTimeout: any;
  replyToMessage: Message | null = null;
  capturedImage = '';
  pinnedMessage: PinnedMessage | null = null;
  pinnedMessageDetails: any = null;
  private pinnedMessageSubscription: any;
  showMobilePinnedBanner: boolean = false;
  chatName: string = '';
  onlineCount: number = 0;

  showPopover = false;
  popoverEvent: any;
  isSending = false;

  limit = 15; // Load 15 messages at a time
  page = 0;
  isLoadingMore = false;
  hasMoreMessages = true;
  allMessages: Message[] = []; // Store all messages
  displayedMessages: Message[] = []; // Messages currently shown
  private lastMessageKey: string | null = null;

  receiverProfile: string | null = null;

  // block state flags
  iBlocked = false;
  theyBlocked = false;

  // UI bubbles
  showBlockBubble = false;
  showUnblockBubble = false;
  private blockBubbleTimeout: any = null;

  // refs for listeners (so we can off them)
  private iBlockedRef: any = null;
  private theyBlockedRef: any = null;
  private _iBlockedLoaded = false;
  private _theyBlockedLoaded = false;

  // Typing indicator related
  private typingInput$ = new Subject<void>();
  private typingRxSubs: RxSub[] = [];
  typingCount = 0;
  typingFrom: string | null = null;
  private localTypingTimer: any = null;
  private typingUnsubscribe: (() => void) | null = null;
  typingUsers: { userId: string; name: string | null; avatar: string | null }[] = [];

  private statusPollSub?: Subscription;
  public receiverOnline = false;
  public receiverLastSeen: string | null = null;

  // store unsubscribes for firebase onValue
  private onValueUnsubs: Array<() => void> = [];

  communityId: string = '';

  constructor(
    private chatService: FirebaseChatService,
    private route: ActivatedRoute,
    private platform: Platform,
    private encryptionService: EncryptionService,
    private router: Router,
    private secureStorage: SecureStorageService,
    private fileUploadService: FileUploadService,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private FileService: FileSystemService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
    private clipboard: Clipboard,
    private authService: AuthService,
    private service: ApiService,
    private sqliteService: SqliteService,
    private alertCtrl: AlertController,
    private typingService: TypingService,
    private renderer: Renderer2,
    private el: ElementRef,
    private zone: NgZone,
    private presence : PresenceService
  ) { }

  async ngOnInit() {
  Keyboard.setScroll({ isDisabled: false });

  this.senderId = this.authService.authData?.userId || '';
  this.sender_phone = this.authService.authData?.phone_number || '';
  this.sender_name = this.authService.authData?.name || '';

  const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
  this.receiver_name =
    nameFromQuery || (await this.secureStorage.getItem('receiver_name')) || '';

  const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
  const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
  const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

  // 👇 communityId nikal lo
  this.communityId = this.route.snapshot.queryParamMap.get('communityId') || '';

  this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

  if (this.chatType === 'group') {
    this.roomId = decodeURIComponent(rawId);

    try {
      const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
      this.groupName = groupName;
      this.groupMembers = groupMembers;
    } catch (err) {
      console.warn('Failed to fetch group with profiles', err);
      this.groupName = 'Group';
      this.groupMembers = [];
    }
  } else {
    this.receiverId = decodeURIComponent(rawId);
    this.roomId = this.getRoomId(this.senderId, this.receiverId);
    this.receiver_phone =
      phoneFromQuery || localStorage.getItem('receiver_phone') || '';
    localStorage.setItem('receiver_phone', this.receiver_phone);
  }

  this.setupTypingListener();

  await this.chatService.resetUnreadCount(this.roomId, this.senderId);
  await this.markMessagesAsRead();

  try {
    const db = getDatabase();
    try {
      const myTypingRef = dbRef(db, `typing/${this.roomId}/${this.senderId}`);
      onDisconnect(myTypingRef).remove();
    } catch (err) {
      console.warn('onDisconnect setup failed', err);
    }

    const tsub = this.typingInput$
      .pipe(throttleTime(1200, undefined, { leading: true, trailing: true }))
      .subscribe(() => {
        this.sendTypingSignal();
      });
    this.typingRxSubs.push(tsub);
  } catch (err) {
    console.warn('Typing setup error', err);
  }

  await this.loadFromLocalStorage();
  this.listenForMessages();
  this.setupPinnedMessageListener();
  this.checkMobileView();
  setTimeout(() => this.scrollToBottom(), 100);
  await this.loadInitialMessages();
  this.loadReceiverProfile();
  await this.checkIfBlocked();
  this.startReceiverStatusPoll();

  //console.log('✅ Community ID:', this.communityId);
}

  onInputTyping() {
    this.onInputChange();
    this.typingInput$.next();
    if (this.localTypingTimer) {
      clearTimeout(this.localTypingTimer);
    }
    this.localTypingTimer = setTimeout(() => {
      this.stopTypingSignal();
    }, 2500);
  }

  onInputBlurTyping() {
    this.stopTypingSignal();
  }

  private async sendTypingSignal() {
    try {
      await this.typingService.startTyping(this.roomId, this.senderId);
      if (this.localTypingTimer) clearTimeout(this.localTypingTimer);
      this.localTypingTimer = setTimeout(() => {
        this.stopTypingSignal();
      }, 2500);
    } catch (err) {
      console.warn('startTyping failed', err);
    }
  }

  private async stopTypingSignal() {
    try {
      if (this.localTypingTimer) {
        clearTimeout(this.localTypingTimer);
        this.localTypingTimer = null;
      }
      await this.typingService.stopTyping(this.roomId, this.senderId);
    } catch (err) {
      console.warn('stopTyping failed', err);
    }
  }

  async ionViewWillEnter() {
    Keyboard.setScroll({ isDisabled: false });

    this.senderId = this.authService.authData?.userId || '';
    this.sender_phone = this.authService.authData?.phone_number || '';
    this.sender_name = this.authService.authData?.name || '';

    const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
    this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

    const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
    const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

    this.communityId = this.route.snapshot.queryParamMap.get('communityId') || '';

    this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

    if (this.chatType === 'group') {
      this.roomId = decodeURIComponent(rawId);

      try {
        const { groupName, groupMembers } = await this.chatService.fetchGroupWithProfiles(this.roomId);
        this.groupName = groupName;
        this.groupMembers = groupMembers;
      } catch (err) {
        console.warn('Failed to fetch group with profiles', err);
        this.groupName = 'Group';
        this.groupMembers = [];
      }

      this.setupTypingListener();
    } else {
      this.receiverId = decodeURIComponent(rawId);
      this.roomId = this.getRoomId(this.senderId, this.receiverId);
      this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
      localStorage.setItem('receiver_phone', this.receiver_phone);
    }

    await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    await this.markMessagesAsRead();

    await this.loadFromLocalStorage();
    this.listenForMessages();

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state && state['imageToSend']) {
      this.attachmentPath = state['imageToSend'];
    }

    this.loadReceiverProfile();
  }

  loadReceiverProfile() {
    this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    if (!this.receiverId) return;

    if (this.chatType === 'group') {
      this.service.getGroupDp(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.group_dp_url || null;
        },
        error: (err) => {
          console.error("❌ Error loading group profile:", err);
          this.receiverProfile = null;
        }
      });
    } else {
      this.service.getUserProfilebyId(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.profile || null;
        },
        error: (err) => {
          console.error("❌ Error loading user profile:", err);
          this.receiverProfile = null;
        }
      });
    }
  }

  setDefaultAvatar(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
  }

  async openOptions(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ChatOptionsPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        chatType: this.chatType,
      },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.selected) {
      this.handleOption(data.selected);
    }
  }

  async handleOption(option: string) {
    if (option === 'Search') {
      this.showSearchBar = true;
      setTimeout(() => {
        const input = document.querySelector('ion-input');
        (input as HTMLIonInputElement)?.setFocus();
      }, 100);
      return;
    }

    if (option === 'View Contact') {
      const queryParams: any = {
        receiverId: this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: false
      };
      this.router.navigate(['/profile-screen'], { queryParams });
      return;
    }

    const groupId = this.receiverId;
    const userId = await this.secureStorage.getItem('userId');

    if (option === 'Group Info') {
      const queryParams: any = {
        receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: this.chatType === 'group'
      };
      this.router.navigate(['/profile-screen'], { queryParams });

    } else if (option === 'Add Members') {
      const memberPhones = this.groupMembers.map(member => member.phone);
      this.router.navigate(['/add-members'], {
        queryParams: {
          groupId: groupId,
          members: JSON.stringify(memberPhones)
        }
      });

    } else if (option === 'Exit Group') {
      if (!groupId || !userId) {
        console.error('Missing groupId or userId');
        return;
      }

      const db = getDatabase();
      const memberPath = `groups/${groupId}/members/${userId}`;
      const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;

      try {
        const memberSnap = await get(ref(db, memberPath));

        if (!memberSnap.exists()) {
          console.error('Member data not found in Firebase');
          return;
        }

        const memberData = memberSnap.val();
        const updatedMemberData = {
          ...memberData,
          status: 'inactive',
          removedAt: new Date().toLocaleString()
        };

        await update(ref(db, memberPath), { status: 'inactive' });
        await set(ref(db, pastMemberPath), updatedMemberData);
        await remove(ref(db, memberPath));

        const toast = await this.toastCtrl.create({
          message: `You exited the group`,
          duration: 2000,
          color: 'medium'
        });
        toast.present();

        this.router.navigate(['/home-screen']);
      } catch (error) {
        console.error('Error exiting group:', error);
        const toast = await this.toastCtrl.create({
          message: `You exited the group`,
          duration: 2000,
          color: 'medium'
        });
        await toast.present();
      }
    }
  }

  async checkIfBlocked() {
    this.senderId = this.authService.authData?.userId || this.senderId;
    if (!this.senderId || !this.receiverId) return;

    const db = getDatabase();

    try {
      if (this.iBlockedRef) off(this.iBlockedRef);
      if (this.theyBlockedRef) off(this.theyBlockedRef);
    } catch (e) { /* ignore */ }

    this.iBlockedRef = ref(db, `blockedContacts/${this.senderId}/${this.receiverId}`);
    this.theyBlockedRef = ref(db, `blockedContacts/${this.receiverId}/${this.senderId}`);

    const unsubA = onValue(this.iBlockedRef, (snap) => {
      const exists = snap.exists();
      this.zone.run(() => {
        if (this._iBlockedLoaded && exists !== this.iBlocked) {
          if (exists) {
            clearTimeout(this.blockBubbleTimeout);
            this.showBlockBubble = true;
            this.showUnblockBubble = false;
            setTimeout(() => this.scrollToBottom(), 120);
          } else {
            this.showBlockBubble = false;
            this.showUnblockBubble = true;
            clearTimeout(this.blockBubbleTimeout);
            this.blockBubbleTimeout = setTimeout(() => {
              this.showUnblockBubble = false;
            }, 3000);
          }
        }
        this.iBlocked = exists;
        this._iBlockedLoaded = true;
      });
    });

    const unsubB = onValue(this.theyBlockedRef, (snap) => {
      const exists = snap.exists();
      this.zone.run(() => {
        this.theyBlocked = exists;
        this._theyBlockedLoaded = true;
      });
    });

    this.onValueUnsubs.push(() => { try { unsubA(); } catch (e) { } });
    this.onValueUnsubs.push(() => { try { unsubB(); } catch (e) { } });
  }

  async unblockFromChat() {
    try {
      const db = getDatabase();
      await remove(ref(db, `blockedContacts/${this.senderId}/${this.receiverId}`));
      this.showBlockBubble = false;
      this.showUnblockBubble = true;
      clearTimeout(this.blockBubbleTimeout);
      this.blockBubbleTimeout = setTimeout(() => { this.showUnblockBubble = false; }, 3000);
    } catch (err) {
      console.error('Unblock failed', err);
      const t = await this.toastCtrl.create({ message: 'Failed to unblock', duration: 2000, color: 'danger' });
      t.present();
    }
  }

  async deleteChat() {
    try {
      const db = getDatabase();
      await remove(ref(db, `chats/${this.roomId}`));
      localStorage.removeItem(this.roomId);
      const t = await this.toastCtrl.create({ message: 'Chat deleted', duration: 1500, color: 'danger' });
      t.present();
      setTimeout(() => this.router.navigate(['/home-screen']), 800);
    } catch (err) {
      console.error('deleteChat failed', err);
      const t = await this.toastCtrl.create({ message: 'Failed to delete chat', duration: 2000, color: 'danger' });
      t.present();
    }
  }

  onSearchInput() {
    const elements = Array.from(document.querySelectorAll('.message-text')) as HTMLElement[];

    elements.forEach(el => {
      el.innerHTML = el.textContent || '';
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) {
      this.matchedMessages = [];
      this.currentSearchIndex = -1;
      return;
    }

    const regex = new RegExp(`(${this.escapeRegExp(this.searchText)})`, 'gi');

    this.matchedMessages = [];

    elements.forEach(el => {
      const originalText = el.textContent || '';
      if (regex.test(originalText)) {
        const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
        el.innerHTML = highlightedText;
        this.matchedMessages.push(el);
      }
    });

    this.currentSearchIndex = this.matchedMessages.length ? 0 : -1;

    if (this.currentSearchIndex >= 0) {
      this.matchedMessages[this.currentSearchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  navigateSearch(direction: 'up' | 'down') {
    if (!this.matchedMessages.length) return;
    if (direction === 'up') {
      this.currentSearchIndex = (this.currentSearchIndex - 1 + this.matchedMessages.length) % this.matchedMessages.length;
    } else {
      this.currentSearchIndex = (this.currentSearchIndex + 1) % this.matchedMessages.length;
    }
    this.highlightMessage(this.currentSearchIndex);
  }

  highlightMessage(index: number) {
    this.matchedMessages.forEach(el => {
      const originalText = el.textContent || '';
      el.innerHTML = originalText;
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) return;

    const regex = new RegExp(`(${this.escapeRegExp(this.searchText)})`, 'gi');

    this.matchedMessages.forEach((el) => {
      const originalText = el.textContent || '';
      const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
      el.innerHTML = highlightedText;
    });

    const target = this.matchedMessages[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  cancelSearch() {
    this.searchText = '';
    this.showSearchBar = false;
    this.matchedMessages.forEach(el => {
      el.innerHTML = el.textContent || '';
      el.style.backgroundColor = 'transparent';
    });
    this.matchedMessages = [];
  }

  openPopover(ev: any) {
    this.popoverEvent = ev;
    this.showPopover = true;
  }

  onDateSelected(event: any) {
    const selectedDateObj = new Date(event.detail.value);

    const day = String(selectedDateObj.getDate()).padStart(2, '0');
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const year = selectedDateObj.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    this.selectedDate = event.detail.value;
    this.showPopover = false;
    this.showDateModal = false;

    setTimeout(() => {
      const el = document.getElementById('date-group-' + formattedDate);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('No messages found for selected date:', formattedDate);
      }
    }, 300);
  }

  openDatePicker() {
    this.showDateModal = true;
    //console.log('Opening calendar modal...');
  }

  onMessagePress(message: any) {
    const index = this.selectedMessages.findIndex(m => m.key === message.key);
    if (index > -1) {
      this.selectedMessages.splice(index, 1);
    } else {
      this.selectedMessages.push(message);
    }
  }

  clearSelection() {
    this.selectedMessages = [];
  }

  private async markMessagesAsRead() {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.sender_id !== this.senderId) {
      await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    }
  }

  startLongPress(msg: any) {
    this.longPressTimeout = setTimeout(() => {
      this.onLongPress(msg);
    }, 1000);
  }

  cancelLongPress() {
    clearTimeout(this.longPressTimeout);
  }

  onLongPress(msg: any) {
    this.selectedMessages = [msg];
    this.lastPressedMessage = msg;
  }

  onMessageClick(msg: any) {
    if (this.selectedMessages.length > 0) {
      this.toggleSelection(msg);
      this.lastPressedMessage = msg;
    }
  }

  toggleSelection(msg: any) {
    const index = this.selectedMessages.findIndex((m) => m.message_id === msg.message_id);
    if (index > -1) {
      this.selectedMessages.splice(index, 1);
    } else {
      this.selectedMessages.push(msg);
    }

    this.lastPressedMessage = msg;
  }

  isSelected(msg: any) {
    return this.selectedMessages.some((m) => m.message_id === msg.message_id);
  }

  isOnlyOneTextMessage(): boolean {
    return this.selectedMessages.length === 1 && this.selectedMessages[0].type === 'text';
  }

  isMultipleTextMessages(): boolean {
    return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type === 'text');
  }

  isOnlyOneAttachment(): boolean {
    return this.selectedMessages.length === 1 && this.selectedMessages[0].type !== 'text';
  }

  isMultipleAttachments(): boolean {
    return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type !== 'text');
  }

  isMixedSelection(): boolean {
    const types = this.selectedMessages.map(msg => msg.type);
    return types.includes('text') && types.some(t => t !== 'text');
  }

  async copySelectedMessages() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  replyToMessages() {
    if (this.selectedMessages.length === 1) {
      const messageToReply = this.selectedMessages[0];
      this.setReplyToMessage(messageToReply);
    }
  }

  setReplyToMessage(message: Message) {
    this.replyToMessage = message;
    this.selectedMessages = [];
    this.lastPressedMessage = null;

    setTimeout(() => {
      const inputElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
      if (inputElement) {
        inputElement.setFocus();
      }
    }, 100);
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  getRepliedMessage(replyToMessageId: string): Message | null {
    const msg = this.allMessages.find(msg => {
      return msg.message_id == replyToMessageId;
    }) || null;
    return msg;
  }

  getReplyPreviewText(message: Message): string {
    if (message.text) {
      return message.text.length > 50 ?
        message.text.substring(0, 50) + '...' :
        message.text;
    } else if (message.attachment) {
      const type = (message.attachment as any).type;
      switch (type) {
        case 'image': return '📷 Photo';
        case 'video': return '🎥 Video';
        case 'audio': return '🎵 Audio';
        case 'file': return '📄 Document';
        default: return '📎 Attachment';
      }
    }
    return 'Message';
  }

  scrollToRepliedMessage(replyToMessageId: string) {
    let targetElement: HTMLElement | any;

    const messageElements = document.querySelectorAll('[data-msg-key]');

    this.allMessages.forEach((msg) => {
      if (msg.message_id === replyToMessageId) {
        const element = Array.from(messageElements).find(el =>
          el.getAttribute('data-msg-key') === msg.key
        );
        if (element && element instanceof HTMLElement) {
          targetElement = element;
        }
      }
    });

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      targetElement.classList.add('highlight-message');
      setTimeout(() => {
        targetElement?.classList.remove('highlight-message');
      }, 2000);
    }
  }

  // deleteSelectedMessages() {
  //   this.selectedMessages.forEach(msg => {
  //     this.chatService.deleteMessage(this.roomId, msg.key);
  //   });
  //   this.selectedMessages = [];
  // }

  async deleteSelectedMessages() {
  if (!this.selectedMessages || this.selectedMessages.length === 0) {
    return;
  }

  const count = this.selectedMessages.length;

  // Prepare a small preview (first message text or attachment label)
  let preview = '';
  if (count === 1) {
    const m = this.selectedMessages[0];
    if (m.text && m.text.trim()) {
      preview = m.text.length > 120 ? m.text.substring(0, 120) + '...' : m.text;
    } else if (m.attachment) {
      preview = this.getAttachmentPreview(m.attachment);
    } else {
      preview = 'This message';
    }
  } else {
    preview = `${count} messages`;
  }

  const alert = await this.alertCtrl.create({
    header: 'Delete messages?',
    // you can tweak the message text to anything you want
    message: `Are you sure you want to delete this message. This message is delete for everyone`,
    cssClass: 'delete-confirm-alert',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
        }
      },
      {
        text: 'Delete',
        cssClass: 'danger',
        handler: async () => {
          // Perform deletion. Try calling with forEveryone flag first (if your chatService supports it),
          // otherwise fall back to the existing 2-arg call.
          try {
            // Copy selectedMessages to avoid mutation during deletion loop
            const toDelete = [...this.selectedMessages];

            for (const msg of toDelete) {
              try {
                // Preferred: chatService supports a third param or option for "delete for everyone"
                // (adjust according to your actual chatService API)
                // e.g. deleteMessage(roomId, messageKey, true) or deleteMessage(roomId, messageKey, {forEveryone:true})
                // Try boolean flag first:
                // @ts-ignore
                await this.chatService.deleteMessage(this.roomId, msg.key, true);
              } catch (errFlag) {
                // Fallback: try the old 2-arg signature
                try {
                  await this.chatService.deleteMessage(this.roomId, msg.key);
                } catch (err2) {
                  console.warn('Failed to delete message key:', msg.key, err2);
                }
              }
            }

            // Clear selection and last pressed message
            this.selectedMessages = [];
            this.lastPressedMessage = null;

            const toast = await this.toastCtrl.create({
              message: `${count} message${count > 1 ? 's' : ''} deleted`,
              duration: 1500,
              color: 'danger'
            });
            toast.present();
          } catch (e) {
            console.error('deleteSelectedMessages handler error', e);
            const toast = await this.toastCtrl.create({
              message: 'Failed to delete messages. Try again.',
              duration: 2000,
              color: 'danger'
            });
            toast.present();
          }
        }
      }
    ]
  });

  await alert.present();
}


  onForward() {
    this.chatService.setForwardMessages(this.selectedMessages);
    this.selectedMessages = [];
    this.router.navigate(['/forwardmessage']);
  }

  async onMore(ev?: Event) {
    const hasText = !!this.lastPressedMessage?.text;
    const hasAttachment = !!(
      this.lastPressedMessage?.attachment ||
      this.lastPressedMessage?.file ||
      this.lastPressedMessage?.image ||
      this.lastPressedMessage?.media
    );

    const isPinned = this.pinnedMessage?.key === this.lastPressedMessage?.key;

    const popover = await this.popoverController.create({
      component: MessageMorePopoverComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        hasText: hasText,
        hasAttachment: hasAttachment,
        isPinned: isPinned,
        message: this.lastPressedMessage,
        currentUserId: this.senderId
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.handlePopoverAction(data);
    }
  }

  async handlePopoverAction(action: string) {
    switch (action) {
      case 'info':
        //console.log('Info clicked');
        break;
      case 'copy':
        this.copyMessage();
        break;
      case 'share':
        this.shareMessage();
        break;
      case 'pin':
        this.pinMessage();
        break;
      case 'unpin':
        this.unpinMessage();
        break;
      case 'edit':
        this.editMessage(this.lastPressedMessage);
        break;
    }
  }

  async editMessage(message: Message) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Message',
      inputs: [
        {
          name: 'text',
          type: 'text',
          value: message.text,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data: any) => {
            if (data.text && data.text.trim() !== '') {
              const encryptedText = await this.encryptionService.encrypt(data.text.trim());

              const db = getDatabase();
              const msgRef = ref(db, `chats/${this.roomId}/${message.key}`);

              await update(msgRef, {
                text: encryptedText,
                isEdit: true
              });

              message.text = data.text.trim();
              message.isEdit = true;

              this.lastPressedMessage = { ...message };
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async copyMessage() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  shareMessage() {
    //console.log('Share clicked for attachment:', this.lastPressedMessage);
  }

  pinMessage() {
    const pin: PinnedMessage = {
      messageId: this.lastPressedMessage?.message_id as string,
      key: this.lastPressedMessage?.key,
      pinnedAt: Date.now(),
      pinnedBy: this.senderId,
      roomId: this.roomId,
      scope: 'global'
    };
    this.chatService.pinMessage(pin);
    this.selectedMessages = [];
    this.lastPressedMessage = null;
  }

  setupPinnedMessageListener() {
    this.pinnedMessageSubscription = this.chatService.listenToPinnedMessage(
      this.roomId,
      (pinnedMessage) => {
        this.pinnedMessage = pinnedMessage;
        if (pinnedMessage) {
          this.findPinnedMessageDetails(pinnedMessage.key);
        } else {
          this.pinnedMessageDetails = null;
        }
      }
    );
  }

  findPinnedMessageDetails(messageId: string) {
    for (const group of this.groupedMessages) {
      const foundMessage = group.messages.find(msg => msg.message_id === messageId);
      if (foundMessage) {
        this.pinnedMessageDetails = foundMessage;
        break;
      }
    }
  }

  unpinMessage() {
    if (this.pinnedMessage) {
      this.chatService.unpinMessage(this.roomId);
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  scrollToPinnedMessage() {
    if (this.pinnedMessageDetails) {
      const element = document.querySelector(`[data-msg-key="${this.pinnedMessageDetails.key}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlighted');
        setTimeout(() => element.classList.remove('highlighted'), 2000);
      }
    }
  }

  checkMobileView() {
    this.showMobilePinnedBanner = window.innerWidth < 480;
  }

  openChatInfo() {
    //console.log('Opening chat info');
  }

  async loadInitialMessages() {
    this.isLoadingMore = true;
    try {
      await this.loadFromLocalStorage();
      await this.loadMessagesFromFirebase(false);
    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  getAttachmentIcon(type: string): string {
    switch (type) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'audio': return 'musical-note-outline';
      case 'file': return 'document-outline';
      default: return 'attach-outline';
    }
  }

  private setupTypingListener() {
    try {
      const db = getDatabase();

      try { if (this.typingUnsubscribe) this.typingUnsubscribe(); } catch (e) { }

      const unsubscribe = onValue(dbRef(db, `typing/${this.roomId}`), (snap) => {
        const val = snap.val() || {};
        const now = Date.now();

        const entries = Object.keys(val).map(k => ({
          userId: k,
          typing: val[k]?.typing ?? false,
          lastUpdated: val[k]?.lastUpdated ?? 0,
          name: val[k]?.name ?? null
        }));

        const recent = entries.filter(e =>
          e.userId !== this.senderId &&
          e.typing &&
          (now - (e.lastUpdated || 0)) < 10000
        );

        this.typingCount = recent.length;

        if (this.chatType === 'private') {
          if (recent.length === 0) {
            this.typingUsers = [];
            this.typingFrom = null;
            return;
          }
          const other = recent[0];
          this.typingUsers = [{
            userId: other.userId,
            name: other.name || `User ${other.userId}`,
            avatar: 'assets/images/default-avatar.png'
          }];
          this.typingFrom = this.typingUsers[0].name || null;
          return;
        }

        const usersForDisplay: { userId: string; name: string | null; avatar: string | null }[] = [];

        recent.forEach(e => {
          let member = this.groupMembers.find(m => String(m.user_id) === String(e.userId));
          if (!member) {
            member = this.groupMembers.find(m => m.phone_number && String(m.phone_number) === String(e.userId));
          }

          const avatar = member?.avatar || null;
          const displayName = member?.name || e.name || e.userId;

          usersForDisplay.push({
            userId: e.userId,
            name: displayName,
            avatar: avatar || 'assets/images/default-avatar.png'
          });
        });

        const uniq: { [k: string]: boolean } = {};
        this.typingUsers = usersForDisplay.filter(u => {
          if (uniq[u.userId]) return false;
          uniq[u.userId] = true;
          return true;
        });

        this.typingFrom = this.typingUsers.length ? this.typingUsers[0].name : null;
      });

      this.typingUnsubscribe = () => { try { unsubscribe(); } catch (e) { } };
      this.onValueUnsubs.push(this.typingUnsubscribe);
    } catch (err) {
      console.warn('setupTypingListener error', err);
    }
  }

  async ngAfterViewInit() {
    if (this.ionContent) {
      this.ionContent.ionScroll.subscribe(async (event: any) => {
        if (event.detail.scrollTop < 100 && this.hasMoreMessages && !this.isLoadingMore) {
          await this.loadMoreMessages();
        }
      });
    }

    this.setDynamicPadding();
    window.addEventListener('resize', this.resizeHandler);

    const footer = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
    if (footer && ('ResizeObserver' in window)) {
      const ro = new (window as any).ResizeObserver(() => this.setDynamicPadding());
      ro.observe(footer);
      (this as any)._ro = ro;
    }
  }

  async loadMoreMessages() {
    if (this.isLoadingMore || !this.hasMoreMessages) {
      return;
    }

    this.isLoadingMore = true;
    const currentScrollHeight = this.scrollContainer?.nativeElement?.scrollHeight || 0;

    try {
      await this.loadMessagesFromFirebase(true);

      setTimeout(() => {
        if (this.scrollContainer?.nativeElement) {
          const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
          const scrollDiff = newScrollHeight - currentScrollHeight;
          this.scrollContainer.nativeElement.scrollTop = scrollDiff;
        }
      }, 100);

    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  getRoomId(userA: string, userB: string): string {
    return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
  }


// async listenForMessages() {
//   this.messageSub?.unsubscribe();

//   this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
//     if (!Array.isArray(newMessages)) return;

//     // decrypt all message.text in parallel (preserve order)
//     const decryptPromises = newMessages.map(msg =>
//       this.encryptionService.decrypt(msg.text || '')
//         .then(dt => ({ msg, decryptedText: dt }))
//         .catch(err => {
//           console.warn('decrypt msg.text failed for key', msg.key, err);
//           return { msg, decryptedText: '' };
//         })
//     );

//     const decryptedPairs = await Promise.all(decryptPromises);

//     const existingIndexMap: Record<string, number> = {};
//     this.allMessages.forEach((m, i) => { if (m.key) existingIndexMap[m.key] = i; });

//     for (const pair of decryptedPairs) {
//       const msg = pair.msg;
//       const key = msg.key || uuidv4();

//       // build message object with decrypted text
//       const dm: Message = { ...msg, key, text: pair.decryptedText };

//       // --- decrypt attachment.caption if present ---
//       if (dm.attachment && (dm.attachment as any).caption) {
//         try {
//           const encryptedCaption = (dm.attachment as any).caption;
//           if (encryptedCaption && typeof encryptedCaption === 'string') {
//             const captionPlain = await this.encryptionService.decrypt(encryptedCaption);
//             // overwrite with plaintext for UI convenience
//             (dm.attachment as any).caption = captionPlain;
//             // OR: store separately: (dm.attachment as any).captionPlain = captionPlain;
//           }
//         } catch (err) {
//           console.warn('Failed to decrypt attachment.caption for key', key, err);
//           // leave caption as-is (encrypted) if decryption fails
//         }
//       }

//       const idx = existingIndexMap[dm.key];
//       if (idx !== undefined) {
//         const old = this.allMessages[idx];
//         const merged: Message = { ...old, ...dm };

//         // preserve localOnly client-flag without breaking Message type
//         if ((old as any).localOnly !== undefined) {
//           (merged as any).localOnly = (old as any).localOnly;
//         } else if ((dm as any).localOnly !== undefined) {
//           (merged as any).localOnly = (dm as any).localOnly;
//         }

//         this.allMessages[idx] = merged;
//       } else {
//         this.allMessages.push(dm);
//       }

//       // proactively mark read/delivered as before
//       if (dm.receiver_id === this.senderId && !dm.read) {
//         try {
//           await this.chatService.markRead(this.roomId, dm.key);
//           await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//         } catch (err) {
//           console.warn('markRead/resetUnreadCount failed', err);
//         }
//       }
//     }

//     // sort, slice, group, persist and update UI
//     this.allMessages.sort((a, b) => {
//       const ta = Number(a.timestamp) || new Date(a.timestamp || 0).getTime();
//       const tb = Number(b.timestamp) || new Date(b.timestamp || 0).getTime();
//       return ta - tb;
//     });

//     const keepCount = Math.max(this.limit || 50, this.displayedMessages?.length || 0);
//     const startIdx = Math.max(0, this.allMessages.length - keepCount);
//     this.displayedMessages = this.allMessages.slice(startIdx);

//     this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

//     this.saveToLocalStorage();

//     if (this.pinnedMessage) {
//       this.findPinnedMessageDetails(this.pinnedMessage.key);
//     }

//     await Promise.resolve();
//     this.scrollToBottom();
//     this.observeVisibleMessages();
//   });
// }


async listenForMessages() {
  this.messageSub?.unsubscribe();

  this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
    if (!Array.isArray(newMessages)) return;

    // 1) decrypt all message.text in parallel (preserve order)
    const decryptPromises = newMessages.map(msg =>
      this.encryptionService.decrypt(msg.text || '')
        .then(dt => ({ msg, decryptedText: dt }))
        .catch(err => {
          console.warn('decrypt msg.text failed for key', msg.key, err);
          return { msg, decryptedText: '' };
        })
    );

    const decryptedPairs = await Promise.all(decryptPromises);

    // 2) Build a lookup map by message_id for existing messages (fast dedupe)
    const existingById: Record<string, number> = {};
    this.allMessages.forEach((m, i) => {
      if (m.message_id) existingById[String(m.message_id)] = i;
    });

    // 3) Process incoming messages
    for (const pair of decryptedPairs) {
      const msg = pair.msg;
      const serverKey = msg.key || null;
      const messageId = msg.message_id || uuidv4();

      // Build dm with decrypted text
      const dm: Message = { ...msg, key: serverKey, message_id: messageId, text: pair.decryptedText };

      // decrypt attachment.caption if present (safe)
      if (dm.attachment && (dm.attachment as any).caption) {
        try {
          const encCap = (dm.attachment as any).caption;
          if (encCap && typeof encCap === 'string') {
            const captionPlain = await this.encryptionService.decrypt(encCap);
            (dm.attachment as any).caption = captionPlain;
          }
        } catch (err) {
          console.warn('Failed to decrypt attachment.caption for message_id', messageId, err);
        }
      }

      // check if we already have message with same message_id
      const existingIndex = existingById[String(messageId)];

      if (existingIndex !== undefined) {
        // merge into existing entry (server wins but keep local-only flag if present)
        const old = this.allMessages[existingIndex];
        const merged: Message = {
          ...old,
          ...dm,
          // prefer server key if present
          key: dm.key || old.key
        };

        // preserve client-only flags
        if ((old as any).localOnly !== undefined) (merged as any).localOnly = (old as any).localOnly;
        if ((old as any).isLocallyEdited !== undefined) (merged as any).isLocallyEdited = (old as any).isLocallyEdited;

        this.allMessages[existingIndex] = merged;
      } else {
        // brand new message — push
        this.allMessages.push(dm);
        existingById[String(messageId)] = this.allMessages.length - 1;
      }

      // If message was sent to me and not read, mark read
      if (dm.receiver_id === this.senderId && !dm.read) {
        try {
          await this.chatService.markRead(this.roomId, dm.key);
          await this.chatService.resetUnreadCount(this.roomId, this.senderId);
        } catch (err) {
          console.warn('markRead/resetUnreadCount failed', err);
        }
      }
    }

    // 4) After processing, remove any accidental duplicate message_id entries (safety)
    const seenIds: Record<string, boolean> = {};
    this.allMessages = this.allMessages.filter(m => {
      const id = String(m.message_id || '');
      if (!id) return true;
      if (seenIds[id]) {
        // duplicate -> skip
        return false;
      }
      seenIds[id] = true;
      return true;
    });

    // 5) Sort and update displayed / grouped lists
    this.allMessages.sort((a, b) => {
      const ta = Number(a.timestamp) || new Date(a.timestamp || 0).getTime();
      const tb = Number(b.timestamp) || new Date(b.timestamp || 0).getTime();
      return ta - tb;
    });

    const keepCount = Math.max(this.limit || 50, this.displayedMessages?.length || 0);
    const startIdx = Math.max(0, this.allMessages.length - keepCount);
    this.displayedMessages = this.allMessages.slice(startIdx);

    this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

    this.saveToLocalStorage();

    if (this.pinnedMessage) {
      this.findPinnedMessageDetails(this.pinnedMessage.key);
    }

    await Promise.resolve();
    this.scrollToBottom();
    this.observeVisibleMessages();
  });
}



  private async markDisplayedMessagesAsRead() {
    const unreadMessages = this.displayedMessages.filter(msg =>
      !msg.read && msg.receiver_id === this.senderId
    );

    for (const msg of unreadMessages) {
      await this.chatService.markRead(this.roomId, msg.key);
    }
  }

  observeVisibleMessages() {
    const allMessageElements = document.querySelectorAll('[data-msg-key]');

    allMessageElements.forEach((el: any) => {
      const msgKey = el.getAttribute('data-msg-key');
      const msgIndex = this.displayedMessages.findIndex(m => m.key === msgKey);
      if (msgIndex === -1) return;

      const msg = this.displayedMessages[msgIndex];

      if (!msg.read && msg.receiver_id === this.senderId) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.chatService.markRead(this.roomId, msgKey);
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 1.0
        });

        observer.observe(el);
      }
    });
  }

  async groupMessagesByDate(messages: Message[]) {
    const grouped: { [date: string]: any[] } = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    for (const msg of messages) {
      const timestamp = new Date(msg.timestamp);

      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      (msg as any).time = `${formattedHours}:${formattedMinutes} ${ampm}`;

      if (msg.attachment) {
        const currentUserId = this.authService.authData?.userId;
        const receiverId = msg.receiver_id;

        if (receiverId === currentUserId) {
          (async () => {
            try {
              const apiResponse = await firstValueFrom(
                this.service.getDownloadUrl((msg.attachment as any).mediaId as string)
              );

              if (apiResponse.status && apiResponse.downloadUrl) {
                const response = await fetch(apiResponse.downloadUrl);
                const blob = await response.blob();
                const extension = (msg.attachment as any).fileName?.split('.').pop() || 'dat';
                const filename = `${(msg.attachment as any).mediaId}.${extension}`;
                const file_Path = await this.FileService.saveFileToReceived(filename, blob);
                // await this.sqliteService.saveAttachment(
                //   this.roomId,
                //   (msg.attachment as any).type,
                //   file_Path,
                //   (msg.attachment as any).mediaId as string
                // );
              }
            } catch (error) {
              console.error("Error handling received attachment:", error);
            }
          })();
        }

        // (msg.attachment as any).previewUrl = await this.sqliteService.getAttachmentPreview(
        //   (msg.attachment as any).mediaId as string
        // );
      }

      const isToday =
        timestamp.getDate() === today.getDate() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getFullYear() === today.getFullYear();

      const isYesterday =
        timestamp.getDate() === yesterday.getDate() &&
        timestamp.getMonth() === yesterday.getMonth() &&
        timestamp.getFullYear() === yesterday.getFullYear();

      let label = '';
      if (isToday) {
        label = 'Today';
      } else if (isYesterday) {
        label = 'Yesterday';
      } else {
        const dd = timestamp.getDate().toString().padStart(2, '0');
        const mm = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = timestamp.getFullYear();
        label = `${dd}/${mm}/${yyyy}`;
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(msg);
    }

    return Object.keys(grouped).map(date => ({
      date,
      messages: grouped[date]
    }));
  }

  isLoadingIndicatorVisible(): boolean {
    return this.isLoadingMore;
  }

  async refreshMessages(event?: any) {
    try {
      this.page = 0;
      this.hasMoreMessages = true;
      this.lastMessageKey = null;
      this.allMessages = [];
      this.displayedMessages = [];

      await this.loadInitialMessages();

      if (event) {
        event.target.complete();
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
      if (event) {
        event.target.complete();
      }
    }
  }

  // async loadFromLocalStorage() {
  //   const cached = localStorage.getItem(this.roomId);
  //   if (!cached) return;

  //   try {
  //     const rawMessages = JSON.parse(cached);
  //     const recentMessages = rawMessages.slice(-this.limit * 3);

  //     const decryptedMessages = await Promise.all(recentMessages.map(async (msg: any) => {
  //       const decryptedText = await this.encryptionService.decrypt(msg.text || '');
  //       return { ...msg, text: decryptedText };
  //     }));

  //     this.allMessages = decryptedMessages;
  //     this.displayedMessages = decryptedMessages.slice(-this.limit);
  //     this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

  //     if (decryptedMessages.length > 0) {
  //       this.lastMessageKey = decryptedMessages[0].key;
  //     }

  //   } catch (error) {
  //     console.error('Error loading from localStorage:', error);
  //   }
  // }

  async loadFromLocalStorage() {
  const cached = localStorage.getItem(this.roomId);
  if (!cached) return;

  try {
    const rawMessages = JSON.parse(cached);
    const recentMessages = rawMessages.slice(-this.limit * 3);

    const decryptedMessages = await Promise.all(recentMessages.map(async (msg: any) => {
      let decryptedText = '';
      try {
        decryptedText = await this.encryptionService.decrypt(msg.text || '');
      } catch (e) {
        console.warn('decrypt cached message.text failed', e);
        decryptedText = '';
      }

      // decrypt cached attachment caption if present
      if (msg.attachment && msg.attachment.caption) {
        try {
          const captionPlain = await this.encryptionService.decrypt(msg.attachment.caption);
          msg.attachment.caption = captionPlain; // overwrite with plaintext
          // OR: msg.attachment.captionPlain = captionPlain;
        } catch (e) {
          console.warn('decrypt cached attachment caption failed', e);
        }
      }

      return { ...msg, text: decryptedText };
    }));

    this.allMessages = decryptedMessages;
    this.displayedMessages = decryptedMessages.slice(-this.limit);
    this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

    if (decryptedMessages.length > 0) {
      this.lastMessageKey = decryptedMessages[0].key;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}


  blobToFile(blob: Blob, fileName: string, mimeType?: string): File {
    return new File([blob], fileName, {
      type: mimeType || blob.type,
      lastModified: Date.now(),
    });
  }

  async pickAttachment() {
    const result = await FilePicker.pickFiles({ readData: true });

    if (result?.files?.length) {
      const file = result.files[0];
      const mimeType = file.mimeType;
      const type = mimeType?.startsWith('image')
        ? 'image'
        : mimeType?.startsWith('video')
          ? 'video'
          : 'file';

      let blob = file.blob as Blob;

      if (!blob && file.data) {
        blob = this.FileService.convertToBlob(
          `data:${mimeType};base64,${file.data}`,
          mimeType
        );
      }

      const previewUrl = URL.createObjectURL(blob);

      this.selectedAttachment = {
        type,
        blob,
        fileName: `${Date.now()}.${this.getFileExtension(file.name)}`,
        mimeType,
        fileSize: blob.size,
        previewUrl,
      };

      this.showPreviewModal = true;
    }
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }

  private async compressImage(blob: Blob): Promise<Blob> {
    if (!blob.type.startsWith('image/')) {
      return blob;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      return await imageCompression(blob as any, options);
    } catch (err) {
      console.warn('Image compression failed:', err);
      return blob;
    }
  }

  cancelAttachment() {
    this.selectedAttachment = null;
    this.showPreviewModal = false;
    this.messageText = '';
  }

  setReplyTo(message: Message) {
    this.replyToMessage = message;
  }

  // async sendMessage() {
  //   if (this.isSending) return;

  //   if (this.iBlocked) {
  //     const toast = await this.toastCtrl.create({ message: `Unblock ${this.receiver_name} to send messages.`, duration: 1800, color: 'medium' });
  //     await toast.present();
  //     return;
  //   }

  //   this.isSending = true;

  //   try {
  //     const plainText = this.messageText.trim();

  //     const localKey = uuidv4();
  //     const localMessage: any = {
  //       sender_id: this.senderId,
  //       text: plainText,
  //       timestamp: new Date().toISOString(),
  //       sender_phone: this.sender_phone,
  //       sender_name: this.sender_name,
  //       receiver_id: this.chatType === 'private' ? this.receiverId : '',
  //       receiver_phone: this.receiver_phone,
  //       delivered: false,
  //       read: false,
  //       message_id: uuidv4(),
  //       isDeleted: false,
  //       replyToMessageId: this.replyToMessage?.message_id || '',
  //       isEdit: false,
  //       localOnly: false,
  //       key: localKey
  //     };

  //     if (this.theyBlocked) {
  //       localMessage.localOnly = true;

  //       if (this.selectedAttachment) {
  //         try {
  //           const filename = this.selectedAttachment.fileName || `${Date.now()}.${this.getFileExtension(this.selectedAttachment.fileName || 'dat')}`;
  //           await this.FileService.saveFileToSent(filename, this.selectedAttachment.blob);

  //           localMessage.attachment = {
  //             type: this.selectedAttachment.type,
  //             mediaId: '',
  //             fileName: filename,
  //             mimeType: this.selectedAttachment.mimeType,
  //             fileSize: this.selectedAttachment.fileSize,
  //             caption: plainText,
  //             previewUrl: URL.createObjectURL(this.selectedAttachment.blob)
  //           };

  //           try {
  //             await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, `sent/${filename}`, '');
  //           } catch (e) {
  //             console.warn('sqlite saveAttachment (local) failed', e);
  //           }
  //         } catch (err) {
  //           console.warn('Failed to save attachment locally:', err);
  //         }
  //       }

  //       this.allMessages.push({ ...localMessage });
  //       this.allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  //       const startIdx = Math.max(0, this.allMessages.length - Math.max(this.limit, this.displayedMessages.length || this.limit));
  //       this.displayedMessages = this.allMessages.slice(startIdx);
  //       this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

  //       this.saveToLocalStorage();

  //       this.messageText = '';
  //       this.selectedAttachment = null;
  //       this.showPreviewModal = false;
  //       this.replyToMessage = null;
  //       await this.stopTypingSignal();
  //       this.scrollToBottom();
  //       return;
  //     }

  //     const encryptedText = plainText ? await this.encryptionService.encrypt(plainText) : '';

  //     const serverMessage: Message = {
  //       sender_id: this.senderId,
  //       text: encryptedText,
  //       timestamp: new Date().toISOString(),
  //       sender_phone: this.sender_phone,
  //       sender_name: this.sender_name,
  //       receiver_id: this.chatType === 'private' ? this.receiverId : '',
  //       receiver_phone: this.receiver_phone,
  //       delivered: false,
  //       read: false,
  //       message_id: uuidv4(),
  //       isDeleted: false,
  //       replyToMessageId: this.replyToMessage?.message_id || '',
  //       isEdit: false
  //     };

  //     if (this.selectedAttachment) {
  //       try {
  //         const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);
  //         serverMessage.attachment = {
  //           type: this.selectedAttachment.type,
  //           mediaId: mediaId,
  //           fileName: this.selectedAttachment.fileName,
  //           mimeType: this.selectedAttachment.mimeType,
  //           fileSize: this.selectedAttachment.fileSize,
  //           caption: plainText
  //         };

  //         const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);
  //         await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

  //       } catch (error) {
  //         console.error('Failed to upload attachment:', error);
  //         const toast = await this.toastCtrl.create({
  //           message: 'Failed to upload attachment. Please try again.',
  //           duration: 3000,
  //           color: 'danger'
  //         });
  //         await toast.present();
  //         return;
  //       }
  //     }

  //     await this.chatService.sendMessage(this.roomId, serverMessage, this.chatType, this.senderId);

  //     this.messageText = '';
  //     this.selectedAttachment = null;
  //     this.showPreviewModal = false;
  //     this.replyToMessage = null;
  //     await this.stopTypingSignal();
  //     this.scrollToBottom();

  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     const toast = await this.toastCtrl.create({ message: 'Failed to send message. Please try again.', duration: 3000, color: 'danger' });
  //     await toast.present();
  //   } finally {
  //     this.isSending = false;
  //   }
  // }

  async sendMessage() {
  if (this.isSending) return;

  if (this.iBlocked) {
    const toast = await this.toastCtrl.create({ message: `Unblock ${this.receiver_name} to send messages.`, duration: 1800, color: 'medium' });
    await toast.present();
    return;
  }

  this.isSending = true;

  try {
    const plainText = this.messageText.trim();
    const localKey = uuidv4();

    // Prepare encrypted values depending on whether there is an attachment.
    // If there is an attachment we encrypt caption; otherwise encrypt text.
    let encryptedText = '';
    let encryptedCaption = '';

    if (this.selectedAttachment) {
      // If there's an attachment, encrypt the caption (if provided).
      if (plainText) {
        try {
          encryptedCaption = await this.encryptionService.encrypt(plainText);
        } catch (err) {
          console.warn('encrypt caption failed', err);
          encryptedCaption = ''; // fallback - still send empty caption rather than plain
        }
      }
    } else {
      // No attachment -> encrypt normal text (for message.text)
      if (plainText) {
        try {
          encryptedText = await this.encryptionService.encrypt(plainText);
        } catch (err) {
          console.warn('encrypt text failed', err);
          encryptedText = '';
        }
      }
    }

    const localMessage: any = {
      sender_id: this.senderId,
      text: plainText, // keep human-readable in localMessage for UI; storage uses encrypted fields below
      timestamp: new Date().toISOString(),
      sender_phone: this.sender_phone,
      sender_name: this.sender_name,
      receiver_id: this.chatType === 'private' ? this.receiverId : '',
      receiver_phone: this.receiver_phone,
      delivered: false,
      read: false,
      message_id: uuidv4(),
      isDeleted: false,
      replyToMessageId: this.replyToMessage?.message_id || '',
      isEdit: false,
      localOnly: false,
      key: localKey
    };

    // If THEY have blocked me -> save locally and DO NOT send to server
    if (this.theyBlocked) {
      localMessage.localOnly = true;

      if (this.selectedAttachment) {
        try {
          const filename = this.selectedAttachment.fileName || `${Date.now()}.${this.getFileExtension(this.selectedAttachment.fileName || 'dat')}`;
          await this.FileService.saveFileToSent(filename, this.selectedAttachment.blob);

          // store encrypted caption (so DB/uploadable payload doesn't contain plain text)
          localMessage.attachment = {
            type: this.selectedAttachment.type,
            mediaId: '',
            fileName: filename,
            mimeType: this.selectedAttachment.mimeType,
            fileSize: this.selectedAttachment.fileSize,
            caption: encryptedCaption,
            previewUrl: URL.createObjectURL(this.selectedAttachment.blob)
          };

          try {
            // await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, `sent/${filename}`, '');
          } catch (e) {
            console.warn('sqlite saveAttachment (local) failed', e);
          }
        } catch (err) {
          console.warn('Failed to save attachment locally:', err);
        }
      }

      // push local message for optimistic UI (note: localMessage.text is plain for UI)
      this.allMessages.push({ ...localMessage });
      this.allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const startIdx = Math.max(0, this.allMessages.length - Math.max(this.limit, this.displayedMessages.length || this.limit));
      this.displayedMessages = this.allMessages.slice(startIdx);
      this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

      this.saveToLocalStorage();

      this.messageText = '';
      this.selectedAttachment = null;
      this.showPreviewModal = false;
      this.replyToMessage = null;
      await this.stopTypingSignal();
      this.scrollToBottom();
      return; // do not send to server
    }

    // Build server message. If there is an attachment, keep text empty and put encrypted caption inside attachment.
    const serverMessage: Message = {
      sender_id: this.senderId,
      text: this.selectedAttachment ? '' : encryptedText, // empty when attachment used
      timestamp: new Date().toISOString(),
      sender_phone: this.sender_phone,
      sender_name: this.sender_name,
      receiver_id: this.chatType === 'private' ? this.receiverId : '',
      receiver_phone: this.receiver_phone,
      delivered: false,
      read: false,
      message_id: uuidv4(),
      isDeleted: false,
      replyToMessageId: this.replyToMessage?.message_id || '',
      isEdit: false
    };

    if (this.selectedAttachment) {
      try {
        const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);

        serverMessage.attachment = {
          type: this.selectedAttachment.type,
          mediaId: mediaId,
          fileName: this.selectedAttachment.fileName,
          mimeType: this.selectedAttachment.mimeType,
          fileSize: this.selectedAttachment.fileSize,
          caption: encryptedCaption // send encrypted caption
        };

        const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);
        // await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

      } catch (error) {
        console.error('Failed to upload attachment:', error);
        const toast = await this.toastCtrl.create({
          message: 'Failed to upload attachment. Please try again.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
        return;
      }
    }

    // finally send
    // await this.chatService.sendMessage(this.roomId, serverMessage, this.chatType, this.senderId);

    // clear UI state
    this.messageText = '';
    this.selectedAttachment = null;
    this.showPreviewModal = false;
    this.replyToMessage = null;
    await this.stopTypingSignal();
    this.scrollToBottom();

  } catch (error) {
    console.error('Error sending message:', error);
    const toast = await this.toastCtrl.create({ message: 'Failed to send message. Please try again.', duration: 3000, color: 'danger' });
    await toast.present();
  } finally {
    this.isSending = false;
  }
}

//user online or offline logic
startReceiverStatusPoll(pollIntervalMs = 30000) {
  if (!this.receiverId) return;

  // immediate fetch, then periodic
  this.presence.getStatus(Number(this.receiverId)).subscribe(res => this.handleStatusResponse(res));
  // Start polling while view is active:
  this.statusPollSub = timer(pollIntervalMs, pollIntervalMs).pipe(
    switchMap(() => this.presence.getStatus(Number(this.receiverId)))
  ).subscribe(res => this.handleStatusResponse(res));
}

handleStatusResponse(res: any) {
  if (!res || !res.data) {
    this.receiverOnline = false;
    this.receiverLastSeen = null;
    return;
  }
  this.receiverOnline = Number(res.data.is_online) === 1;
  this.receiverLastSeen = res.data.last_seen ? this.formatLastSeen(res.data.last_seen) : null;
}

formatLastSeen(ts: string | null) {
  if (!ts) return '';
  const d = new Date(ts); // make sure server returns parseable ISO or 'YYYY-MM-DD hh:mm:ss'
  // simple formatting — adjust to locale
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Today at, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}



  private async uploadAttachmentToS3(attachment: any): Promise<string> {
    try {
      const uploadResponse = await firstValueFrom(
        this.service.getUploadUrl(
          parseInt(this.senderId),
          attachment.type,
          attachment.fileSize,
          attachment.mimeType,
          {
            caption: this.messageText.trim(),
            fileName: attachment.fileName
          }
        )
      );

      if (!uploadResponse?.status || !uploadResponse.upload_url) {
        throw new Error('Failed to get upload URL');
      }

      const uploadResult = await firstValueFrom(
        this.service.uploadToS3(uploadResponse.upload_url, this.blobToFile(attachment.blob, attachment.fileName, attachment.mimeType))
      );

      return uploadResponse.media_id;

    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  async openAttachmentModal(msg: any) {
    if (!msg.attachment) return;

    let attachmentUrl = '';

    try {
      const localUrl = await this.FileService.getFilePreview(
        `${msg.sender_id === this.senderId ? 'sent' : 'received'}/${msg.attachment.fileName}`
      );

      if (localUrl) {
        attachmentUrl = localUrl;
      } else {
        const downloadResponse = await firstValueFrom(this.service.getDownloadUrl(msg.attachment.mediaId));

        if (downloadResponse?.status && downloadResponse.downloadUrl) {
          attachmentUrl = downloadResponse.downloadUrl;

          if (msg.sender_id !== this.senderId) {
            this.downloadAndSaveLocally(downloadResponse.downloadUrl, msg.attachment.fileName);
          }
        }
      }

      const modal = await this.modalCtrl.create({
        component: AttachmentPreviewModalComponent,
        componentProps: {
          attachment: {
            ...msg.attachment,
            url: attachmentUrl
          },
          message: msg
        },
        cssClass: 'attachment-modal'
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data && data.action === 'reply') {
        this.setReplyToMessage(data.message);
      }

    } catch (error) {
      console.error('Failed to load attachment:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load attachment',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private async downloadAndSaveLocally(url: string, fileName: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await this.FileService.saveFileToReceived(fileName, blob);
    } catch (error) {
      console.warn('Failed to save file locally:', error);
    }
  }

  getAttachmentPreview(attachment: any): string {
    if (attachment.caption) {
      return attachment.caption.length > 30 ?
        attachment.caption.substring(0, 30) + '...' :
        attachment.caption;
    }

    switch (attachment.type) {
      case 'image': return '📷 Photo';
      case 'video': return '🎥 Video';
      case 'audio': return '🎵 Audio';
      case 'file': return attachment.fileName || '📄 File';
      default: return '📎 Attachment';
    }
  }

  async showAttachmentPreviewPopup() {
    const alert = await this.alertController.create({
      header: 'Send Attachment',
      message: this.getAttachmentPreviewHtml(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.selectedAttachment = null;
          }
        },
        {
          text: 'Send',
          handler: () => {
            this.sendMessage();
          }
        }
      ]
    });

    await alert.present();
  }

  getAttachmentPreviewHtml(): string {
    if (!this.selectedAttachment) return '';

    const { type, base64Data, fileName } = this.selectedAttachment;

    if (type === 'image') {
      return `<img src="${base64Data}" style="max-width: 100%; border-radius: 8px;" />`;
    } else if (type === 'video') {
      return `<video controls style="max-width: 100%; border-radius: 8px;">
              <source src="${base64Data}" type="video/mp4" />
            </video>`;
    } else if (type === 'audio') {
      return `<audio controls>
              <source src="${base64Data}" type="audio/mpeg" />
            </audio>`;
    } else {
      return `<p>📎 ${fileName || 'File attached'}</p>`;
    }
  }

  getMimeTypeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return '';
    }
  }

  // async loadMessagesFromFirebase(loadMore = false) {
  //   try {
  //     const db = getDatabase();
  //     const messagesRef = ref(db, `chats/${this.roomId}`);

  //     let qry;

  //     if (loadMore && this.lastMessageKey) {
  //       qry = query(
  //         messagesRef,
  //         orderByKey(),
  //         endBefore(this.lastMessageKey),
  //         limitToLast(this.limit)
  //       );
  //     } else {
  //       qry = query(
  //         messagesRef,
  //         orderByKey(),
  //         limitToLast(this.limit)
  //       );
  //     }

  //     const snapshot = await get(qry);

  //     if (snapshot.exists()) {
  //       const newMessages: Message[] = [];
  //       const messagesData = snapshot.val();

  //       const messageKeys = Object.keys(messagesData).sort();

  //       const decryptTasks = messageKeys.map(async (key) => {
  //         const msg = messagesData[key];
  //         const decryptedText = await this.encryptionService.decrypt(msg.text || '');
  //         return {
  //           ...msg,
  //           key: key,
  //           text: decryptedText
  //         } as Message;
  //       });

  //       const results = await Promise.all(decryptTasks);

  //       if (loadMore) {
  //         this.allMessages = [...results, ...this.allMessages];
  //         this.displayedMessages = [...results, ...this.displayedMessages];
  //       } else {
  //         this.allMessages = results;
  //         this.displayedMessages = results;
  //       }

  //       if (results.length > 0) {
  //         this.lastMessageKey = results[0].key;
  //       }

  //       this.hasMoreMessages = results.length === this.limit;

  //       this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

  //       this.saveToLocalStorage();

  //       await this.markDisplayedMessagesAsRead();

  //     } else {
  //       this.hasMoreMessages = false;
  //     }

  //   } catch (error) {
  //     console.error('Error loading messages from Firebase:', error);
  //   }
  // }

  async loadMessagesFromFirebase(loadMore = false) {
  try {
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${this.roomId}`);

    let qry;
    if (loadMore && this.lastMessageKey) {
      qry = query(messagesRef, orderByKey(), endBefore(this.lastMessageKey), limitToLast(this.limit));
    } else {
      qry = query(messagesRef, orderByKey(), limitToLast(this.limit));
    }

    const snapshot = await get(qry);

    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      const messageKeys = Object.keys(messagesData).sort();

      const decryptTasks = messageKeys.map(async (key) => {
        const msg = messagesData[key];

        // decrypt text
        let decryptedText = '';
        try {
          decryptedText = await this.encryptionService.decrypt(msg.text || '');
        } catch (e) {
          console.warn('decrypt text failed for key', key, e);
          decryptedText = '';
        }

        // decrypt attachment.caption if present
        if (msg.attachment && msg.attachment.caption) {
          try {
            const decryptedCaption = await this.encryptionService.decrypt(msg.attachment.caption);
            msg.attachment.caption = decryptedCaption; // overwrite with plaintext
            // OR: msg.attachment.captionPlain = decryptedCaption;
          } catch (e) {
            console.warn('decrypt attachment caption failed for key', key, e);
          }
        }

        return {
          ...msg,
          key: key,
          text: decryptedText
        } as Message;
      });

      const results = await Promise.all(decryptTasks);

      if (loadMore) {
        this.allMessages = [...results, ...this.allMessages];
        this.displayedMessages = [...results, ...this.displayedMessages];
      } else {
        this.allMessages = results;
        this.displayedMessages = results;
      }

      if (results.length > 0) {
        this.lastMessageKey = results[0].key;
      }

      this.hasMoreMessages = results.length === this.limit;

      this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

      this.saveToLocalStorage();

      await this.markDisplayedMessagesAsRead();
    } else {
      this.hasMoreMessages = false;
    }
  } catch (error) {
    console.error('Error loading messages from Firebase:', error);
  }
}


  goToProfile() {
    const queryParams: any = {
      receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
      receiver_phone: this.receiver_phone,
      receiver_name: this.receiver_name,
      isGroup: this.chatType === 'group',
      communityId: this.communityId
    };

    this.router.navigate(['/profile-screen'], { queryParams });
  }

  saveToLocalStorage() {
    try {
      const messagesToSave = this.allMessages.slice(-100);
      localStorage.setItem(this.roomId, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  scrollToBottom() {
    if (this.ionContent) {
      setTimeout(() => {
        this.ionContent.scrollToBottom(300);
      }, 100);
    }
  }

  onInputChange() {
    this.showSendButton = this.messageText?.trim().length > 0;
  }

  onInputFocus() {
    this.setDynamicPadding();
  }

  onInputBlur() {
    this.onInputBlurTyping();
    this.setDynamicPadding();
  }

  goToCallingScreen() {
    this.router.navigate(['/calling-screen']);
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.Uri
      });
      this.capturedImage = image.webPath!;
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  openKeyboard() {
    setTimeout(() => {
      const textareaElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
      if (textareaElement) {
        textareaElement.setFocus();
      }
    }, 100);
  }

  ngOnDestroy() {
    this.keyboardListeners.forEach(listener => listener?.remove());
    this.messageSub?.unsubscribe();
    if (this.pinnedMessageSubscription) {
      try { this.pinnedMessageSubscription(); } catch (e) { }
    }
    this.typingRxSubs.forEach(s => s.unsubscribe());
    try {
      if (this.typingUnsubscribe) this.typingUnsubscribe();
    } catch (e) { }
    this.stopTypingSignal();

    window.removeEventListener('resize', this.resizeHandler);
    if ((this as any)._ro) {
      (this as any)._ro.disconnect();
    }

    try {
      if (this.iBlockedRef) off(this.iBlockedRef);
      if (this.theyBlockedRef) off(this.theyBlockedRef);
      clearTimeout(this.blockBubbleTimeout);
    } catch (e) { }

    this.onValueUnsubs.forEach(fn => {
      try { fn(); } catch (e) { }
    });
    this.onValueUnsubs = [];
    this.statusPollSub?.unsubscribe();
  }

  private isGestureNavigation(): boolean {
    const screenHeight = window.screen.height || 0;
    const innerHeight = window.innerHeight || 0;
    const diff = screenHeight - innerHeight;
    return diff < 40;
  }

  private isTransparentButtonNav(): boolean {
    const screenHeight = window.screen.height || 0;
    const innerHeight = window.innerHeight || 0;
    const diff = screenHeight - innerHeight;
    return diff < 5;
  }

  setDynamicPadding() {
    const footerEl = this.el.nativeElement.querySelector('.footer-fixed') as HTMLElement;
    if (!footerEl) return;

    if (this.platform.is('ios')) {
      const safeAreaBottom = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')
      ) || 0;

      if (safeAreaBottom > 0) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '16px');
      } else {
        this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
      }
    } else {
      if (this.isGestureNavigation()) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
      } else if (this.isTransparentButtonNav()) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
      } else {
        this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
      }
    }
  }

  onKeyboardOrInputChange() {
    this.setDynamicPadding();
  }

  // ---------- small helpers ----------
  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  backToCommunity(){
    this.router.navigate(['/community-detail'], {
      queryParams: { communityId: this.communityId }
    });
  }
}

