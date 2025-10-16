import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  push,
  onValue,
  set,
  get,
  child,
  runTransaction,
} from '@angular/fire/database';
import {
  ref as rtdbRef,
  update as rtdbUpdate,
  set as rtdbSet,
  get as rtdbGet,
  DataSnapshot,
  onValue as rtdbOnValue,
  query,
  orderByKey,
  startAt,
  limitToLast,
  onChildAdded,
  onChildRemoved,
  onChildChanged,
  off,
  orderByChild,
} from 'firebase/database';
import { runTransaction as rtdbRunTransaction } from 'firebase/database';
import { BehaviorSubject, firstValueFrom, map, Observable, take } from 'rxjs';
import { getDatabase, remove, update } from 'firebase/database';
import { IChat, IChatMeta, Message, PinnedMessage } from 'src/types';
import { ApiService } from './api/api.service';
import {
  IAttachment,
  IConversation,
  IGroup,
  IGroupMember,
  IMessage,
  IUser,
  SqliteService,
} from './sqlite.service';
import { ContactSyncService } from './contact-sync.service';
import { Platform } from '@ionic/angular';
import { NetworkService } from './network-connection/network.service';
import { EncryptionService } from './encryption.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseChatService {
  // =====================
  // ======= DATA ========
  // =====================
  isAppInitialized: boolean = false;
  private senderId: string | null = null;
  private forwardMessages: any[] = [];
  private _selectedMessageInfo: any = null;
  private _conversations$ = new BehaviorSubject<IConversation[]>([]);
  private _platformUsers$ = new BehaviorSubject<Partial<IUser>[]>([]);
  platformUsers$ = this._platformUsers$.asObservable();
  private _deviceContacts$ = new BehaviorSubject<
    { username: string; phoneNumber: string }[]
  >([]);
  deviceContacts$ = this._deviceContacts$.asObservable();
  private _isSyncing$ = new BehaviorSubject<boolean>(false);
  isSyncing$ = this._isSyncing$.asObservable();
  private _offsets$ = new BehaviorSubject<Map<string, number>>(new Map());
  private _messages$ = new BehaviorSubject<Map<string, IMessage[]>>(new Map());
  private _totalMessages: number = 0;

  private _userChatsListener: (() => void) | null = null;
  private _roomMessageListner: any = null;

  currentChat: IConversation | null = null;

  constructor(
    private db: Database,
    private service: ApiService,
    private sqliteService: SqliteService,
    private contactsyncService: ContactSyncService,
    private platform: Platform,
    private apiService: ApiService,
    private networkService: NetworkService,
    private encryptionService: EncryptionService,
    private authService: AuthService
  ) {}

  private isWeb(): boolean {
    return (
      this.platform.is('android') ||
      this.platform.is('ios') ||
      this.platform.is('ipad') ||
      this.platform.is('iphone')
    );
  }

  get conversations() {
    return this._conversations$
      .asObservable()
      .pipe(
        map((convs) =>
          convs.sort(
            (b, a) =>
              Number(a.lastMessageAt || 0) - Number(b.lastMessageAt || 0)
          )
        )
      );
  }

  get currentConversations(): IConversation[] {
    return this._conversations$.value;
  }

  get currentUsers(): Partial<IUser>[] {
    return this._platformUsers$.value;
  }

  get currentDeviceContacts(): any[] {
    return this._deviceContacts$.value;
  }

  pushMsgToChat(msg: any) {
    const existing = new Map(this._messages$.value);
    const currentMessages =
      existing.get(this.currentChat?.roomId as string) || [];
    currentMessages?.push({ ...msg, isMe: msg.sender === this.senderId });
    existing.set(
      this.currentChat?.roomId as string,
      currentMessages as IMessage[]
    );
    // console.log({ currentMessages });
    this._messages$.next(existing);
  }

  getRoomIdFor1To1(senderId: string, receiverId: string): string {
    return senderId < receiverId
      ? `${senderId}_${receiverId}`
      : `${receiverId}_${senderId}`;
  }

  async openChat(chat: any, isNew: boolean = false) {
    let conv: any = null;
    if (isNew) {
      const { receiver }: { receiver: IUser } = chat;
      const roomId = this.getRoomIdFor1To1(
        this.senderId as string,
        receiver.userId
      );
      conv = this.currentConversations.find((c) => c.roomId === roomId);
      if (!conv) {
        conv = {
          title: receiver.username,
          type: 'private',
          roomId: roomId,
          members: [this.senderId, receiver.userId],
        } as unknown as IConversation;
      }
    } else {
      conv = this.currentConversations.find((c) => c.roomId === chat.roomId);
    }

    this.currentChat = { ...(conv as IConversation) };

    this._roomMessageListner = this.listenRoomStream(conv?.roomId as string, {
      onAdd: async (msgKey, data, isNew) => {
        if (isNew && data.sender !== this.senderId) {
          const decryptedText = await this.encryptionService.decrypt(
            data.text as string
          );
          this.pushMsgToChat({ msgId: msgKey, ...data, text: decryptedText });
        }
      },
      onChange(msgKey, data) {
        console.log(`Message updated with key ${msgKey}-> `, data);
      },
      onRemove(msgKey) {
        console.log(`Message removed with key ${msgKey}`);
      },
    });
  }

  async closeChat() {
    if (this._roomMessageListner) {
      this._roomMessageListner();
      this._roomMessageListner = null;
    }
    this.currentChat = null;
  }

  async initApp(rootUserId?: string) {
    try {
      this.senderId = rootUserId || '';
      if (this.isAppInitialized) {
        console.warn('App already initialized!');
        return;
      }
      this.networkService.isOnline$.subscribe((isOnline) => {
        if (!isOnline) {
          console.log('User is offline');
          throw new Error('user is offline');
        }
      });
      this.loadConversations();
      let normalizedContacts: any[] = [];
      if (this.isWeb()) {
        try {
          normalizedContacts =
            (await this.contactsyncService.getDevicePhoneNumbers?.()) || [];
        } catch (e) {
          console.warn('Failed to get device contacts', e);
        }
      } else {
        normalizedContacts = [];
      }

      const pfUsers = await this.contactsyncService.getMatchedUsers();
      await this.sqliteService.upsertContacts(pfUsers);
      this._deviceContacts$.next([...normalizedContacts]);
      this._platformUsers$.next([...pfUsers]);
      await this.loadConversations();
      this.isAppInitialized = true;
    } catch (err) {
      console.error('initApp failed', err);
      try {
        const fallbackContacts =
          await this.contactsyncService.getDevicePhoneNumbers?.();
        if (fallbackContacts) {
          this._deviceContacts$.next([...fallbackContacts]);
        }
        await this.loadConversations();
        const cachedPfUsers = await this.sqliteService.getContacts();
        this._platformUsers$.next([...cachedPfUsers]);
      } catch (fallbackErr) {
        console.error('initApp fallback failed', fallbackErr);
        this._deviceContacts$.next([]);
        this._platformUsers$.next([]);
      }
    }
  }

  async loadConversations() {
    try {
      const convs = (await this.sqliteService.getConversations?.()) || [];
      this._conversations$.next([...convs]);
      this.syncConversationWithServer();
      return convs;
    } catch (err) {
      console.error('loadConversations', err);
      return [];
    }
  }

  private async fetchPrivateConvDetails(
    roomId: string,
    meta: any
  ): Promise<IConversation> {
    const isWeb = this.isWeb();

    const parts = roomId.split('_');
    const receiverId =
      parts.find((p) => p !== this.senderId) ?? parts[parts.length - 1];

    const localUser: Partial<IUser> | undefined =
      this._platformUsers$.value.find((u) => u.userId === receiverId);

    let profileResp: {
      phone_number: string;
      profile: string | null;
      name: string;
      publicKeyHex?: string;
    } | null = null;

    if (isWeb) {
      try {
        profileResp = await firstValueFrom(
          this.apiService.getUserProfilebyId(receiverId)
        );
      } catch (err) {
        console.warn('Failed to fetch profile (web)', receiverId, err);
      }
    } else if (!localUser) {
      try {
        profileResp = await firstValueFrom(
          this.apiService.getUserProfilebyId(receiverId)
        );
      } catch (err) {
        console.warn(
          'Failed to fetch profile (native fallback)',
          receiverId,
          err
        );
      }
    }

    let titleToShow = 'Unknown';
    console.error('isWeb', isWeb);
    if (isWeb) {
      titleToShow =
        profileResp?.phone_number ??
        localUser?.phoneNumber ??
        profileResp?.name ??
        localUser?.username ??
        'Unknown';
    } else {
      titleToShow =
        localUser?.username ??
        profileResp?.name ??
        profileResp?.phone_number ??
        localUser?.phoneNumber ??
        'Unknown';
    }

    const decryptedText = await this.encryptionService.decrypt(
      meta?.lastmessage
    );

    const conv: IConversation = {
      roomId,
      type: 'private',
      title: titleToShow,
      phoneNumber: profileResp?.phone_number ?? localUser?.phoneNumber,
      avatar: localUser?.avatar ?? profileResp?.profile ?? undefined,
      members: [this.senderId, receiverId],
      isMyself: false,
      isArchived: meta?.isArchived,
      isPinned: meta?.isPinned,
      isLocked: meta?.isLocked,
      lastMessage: decryptedText ?? undefined,
      lastMessageType: meta?.lastmessageType ?? undefined,
      lastMessageAt: meta?.lastmessageAt
        ? new Date(Number(meta.lastmessageAt))
        : undefined,
      unreadCount:
        typeof meta?.unreadCount === 'number'
          ? meta.unreadCount
          : Number(meta?.unreadCount) || 0,
      updatedAt: meta?.lastmessageAt
        ? new Date(Number(meta.lastmessageAt))
        : undefined,
    } as IConversation;

    return conv;
  }

  private parseDate(value: any): Date | undefined {
    if (!value && value !== 0) return undefined;
    if (value instanceof Date) return value;
    const n =
      typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
    if (typeof n === 'number' && !Number.isNaN(n)) return new Date(n);
    const parsed = Date.parse(String(value));
    return isNaN(parsed) ? undefined : new Date(parsed);
  }

  private async fetchGroupConDetails(
    roomId: string,
    meta: IChatMeta
  ): Promise<IConversation> {
    const groupRef = rtdbRef(this.db, `groups/${roomId}`);
    const groupSnap = await rtdbGet(groupRef);
    const group: Partial<IGroup> = groupSnap.val() || {};
    const membersObj: Record<string, Partial<IGroupMember>> = group.members ||
    {};
    const members = Object.keys(membersObj);

    let decryptedText: string | undefined;
    try {
      decryptedText = await this.encryptionService.decrypt(meta?.lastmessage);
    } catch (e) {
      console.warn('fetchGroupConDetails: decrypt failed for', roomId, e);
      decryptedText =
        typeof meta?.lastmessage === 'string' ? meta.lastmessage : undefined;
    }

    const conv: IConversation = {
      roomId,
      type: meta.type,
      title: group.title || 'GROUP',
      avatar: group.avatar || '',
      members,
      adminIds: group.adminIds || [],
      isArchived: !!meta.isArchived,
      isPinned: !!meta.isPinned,
      isLocked: !!meta.isLocked,
      createdAt: group.createdAt ? this.parseDate(group.createdAt) : undefined,
      lastMessage: decryptedText ?? undefined,
      lastMessageType: meta.lastmessageType ?? undefined,
      lastMessageAt: meta.lastmessageAt
        ? this.parseDate(meta.lastmessageAt)
        : undefined,
      unreadCount: meta.unreadCount || 0,
      updatedAt: meta.lastmessageAt
        ? this.parseDate(meta.lastmessageAt)
        : group.updatedAt
        ? this.parseDate(group.updatedAt)
        : undefined,
    } as IConversation;

    return conv;
  }

  async syncConversationWithServer(): Promise<void> {
    try {
      if (!this.senderId) {
        console.warn('syncConversationWithServer: senderId is not set');
        return;
      }

      this._isSyncing$.next(true);

      const userChatsPath = `userchats/${this.senderId}`;
      const userChatsRef = rtdbRef(this.db, userChatsPath);
      const snapshot: DataSnapshot = await rtdbGet(userChatsRef);
      const userChats = snapshot.val() || {};
      const conversations: IConversation[] = [];
      const roomIds = Object.keys(userChats);
      for (const roomId of roomIds) {
        const meta: IChatMeta = userChats[roomId] || {};
        try {
          const type: IConversation['type'] = meta.type;
          if (type === 'private') {
            const conv = await this.fetchPrivateConvDetails(roomId, meta);
            conversations.push(conv);
          } else if (type === 'group' || type === 'community') {
            const conv = await this.fetchGroupConDetails(roomId, meta);
            conversations.push(conv);
          } else {
            conversations.push({
              roomId,
              type: 'private',
              title: roomId,
              lastMessage: meta?.lastmessage,
              lastMessageAt: meta?.lastmessageAt
                ? new Date(Number(meta.lastmessageAt))
                : undefined,
              unreadCount: Number(meta?.unreadCount) || 0,
            } as IConversation);
          }
        } catch (innerErr) {
          console.error('Error building conversation for', roomId, innerErr);
        }
      }

      const existing = this._conversations$.value;
      const newConversations = conversations.filter(
        ({ roomId }) => !existing.some((c) => c.roomId === roomId)
      );

      if (newConversations.length) {
        for (const conv of newConversations) {
          await this.sqliteService.createConversation({ ...conv });
        }
        this._conversations$.next([...existing, ...newConversations]);
      }

      if (this._userChatsListener) {
        try {
          this._userChatsListener();
        } catch {}
        this._userChatsListener = null;
      }
      const onUserChatsChange = async (snap: DataSnapshot) => {
        const updatedData: IChatMeta = snap.val() || {};
        const current = [...this._conversations$.value];
        for (const [roomId, meta] of Object.entries(updatedData)) {
          const idx = current.findIndex((c) => c.roomId === roomId);
          const chatMeta: IChatMeta = { ...meta, roomId };
          try {
            if (idx > -1) {
              const decryptedText = await this.encryptionService.decrypt(
                chatMeta.lastmessage
              );
              const conv = current[idx];
              current[idx] = {
                ...conv,
                lastMessage: decryptedText ?? conv.lastMessage,
                lastMessageType:
                  chatMeta.lastmessageType ?? conv.lastMessageType,
                lastMessageAt: chatMeta.lastmessageAt
                  ? new Date(Number((meta as any).lastmessageAt))
                  : conv.lastMessageAt,
                unreadCount:
                  typeof chatMeta.unreadCount === 'number'
                    ? (meta as any).unreadcount
                    : Number(chatMeta.unreadCount) || 0,
                updatedAt: chatMeta.lastmessageAt
                  ? new Date(Number(chatMeta.lastmessageAt))
                  : conv.updatedAt,
              };
            } else {
              console.warn(
                'New room detected in userchats but not present locally:',
                roomId
              );
              const type: IConversation['type'] = chatMeta.type || 'private';
              try {
                let newConv: IConversation | null = null;
                if (type === 'private') {
                  newConv = await this.fetchPrivateConvDetails(
                    roomId,
                    chatMeta
                  );
                } else if (type === 'group' || type === 'community') {
                  newConv = await this.fetchGroupConDetails(roomId, chatMeta);
                } else {
                  newConv = {
                    roomId,
                    type: 'private',
                    title: roomId,
                    lastMessage: chatMeta.lastmessage,
                    lastMessageAt: chatMeta.lastmessageAt
                      ? new Date(Number(chatMeta.lastmessageAt))
                      : undefined,
                    unreadCount: Number(chatMeta.unreadCount) || 0,
                  } as IConversation;
                }

                if (newConv) {
                  current.push(newConv);
                  try {
                    await this.sqliteService.createConversation({ ...newConv });
                  } catch (e) {
                    console.warn(
                      'sqlite createConversation failed for new room',
                      roomId,
                      e
                    );
                  }
                }
              } catch (e) {
                console.error(
                  'Failed to fetch details for new room',
                  roomId,
                  e
                );
              }
            }
          } catch (e) {
            console.error('onUserChatsChange inner error for', roomId, e);
          }
        }

        this._conversations$.next(current);
      };

      const unsubscribe = rtdbOnValue(userChatsRef, onUserChatsChange);
      this._userChatsListener = () => {
        try {
          unsubscribe();
        } catch {}
      };
    } catch (error) {
      console.error('syncConversationWithServer error:', error);
    } finally {
      this._isSyncing$.next(false);
    }
  }

  async syncMessagesWithServer(): Promise<void> {
    try {
      const isWeb = !this.isWeb();
      const roomId = this.currentChat?.roomId;
      if (!roomId) {
        console.error('syncMessagesWithServer: No roomId present');
        return;
      }
      const baseRef = rtdbRef(this.db, `chats/${roomId}`);
      const currentMap = new Map(this._messages$.value); // clone map
      const currentArr = currentMap.get(roomId) ?? [];

      const snapToMsg = async (s: DataSnapshot): Promise<any> => {
        const payload = s.val() ?? {};
        const decryptedText = await this.encryptionService.decrypt(
          payload.text as string
        );
        let cdnUrl = '';
        if (payload.attachment) {
          const res = await firstValueFrom(
            this.apiService.getDownloadUrl(payload.attachment.mediaId)
          );
          cdnUrl = res.status ? res.downloadUrl : '';
        }
        return {
          msgId: s.key!,
          isMe: payload.sender === this.senderId,
          ...payload,
          text: decryptedText,
          ...(payload.attachment && {
            attachment: { ...payload.attachment, previewUrl: cdnUrl },
          }),
        };
      };

      if (!currentArr.length) {
        const q = query(baseRef, orderByKey());
        const snap = await rtdbGet(q);
        const fetched: IMessage[] = [];
        const children: any[] = [];
        snap.forEach((child: any) => {
          children.push(child);
        });
        for (const s of children) {
          try {
            const m = await snapToMsg(s);
            fetched.push(m);
            await this.sqliteService.saveMessage({
              ...m,
              roomId: this.currentChat?.roomId,
            });
          } catch (err) {
            console.warn(
              'sqlite saveMessage failed for item',
              s?.key ?? s?.id ?? s,
              err
            );
          }
        }
        fetched.sort((a, b) =>
          a.msgId! < b.msgId! ? -1 : a.msgId! > b.msgId! ? 1 : 0
        );
        fetched.forEach((m) => this.pushMsgToChat(m));
        // currentMap.set(roomId, fetched);
        // this._messages$.next(currentMap);
        // console.log('Messages when no prev ->', fetched);
        return;
      }

      const last =
        currentArr?.sort((a, b) =>
          a.msgId! < b.msgId! ? -1 : a.msgId! > b.msgId! ? 1 : 0
        )?.[currentArr.length - 1] || null;
      const lastKey = last.msgId ?? null;
      if (!lastKey) {
        console.warn(
          'syncMessagesWithServer: last message missing key; falling back to latest page'
        );
        const pageSize = 50;
        const q = query(baseRef, orderByKey(), limitToLast(pageSize));
        const snap = await rtdbGet(q);
        const fetched: IMessage[] = [];
        const children: any[] = [];
        snap.forEach((child: any) => {
          children.push(child);
        });

        for (const s of children) {
          try {
            const m = await snapToMsg(s);
            fetched.push(m);
            await this.sqliteService.saveMessage({
              ...m,
              roomId: this.currentChat?.roomId,
            });
          } catch (err) {
            console.warn(
              'sqlite saveMessage failed for item',
              s?.key ?? s?.id ?? s,
              err
            );
          }
        }
        fetched.sort((a, b) =>
          a.msgId! < b.msgId! ? -1 : a.msgId! > b.msgId! ? 1 : 0
        );
        fetched.forEach((m) => this.pushMsgToChat(m));
        // currentMap.set(roomId, fetched);
        // this._messages$.next(currentMap);
        return;
      }

      const qNew = query(baseRef, orderByKey(), startAt(lastKey as string));
      const snapNew = await rtdbGet(qNew);

      const newMessages: IMessage[] = [];
      const children: any[] = [];
      snapNew.forEach((child: any) => {
        children.push(child);
        return false;
      });

      for (const s of children) {
        try {
          const m = await snapToMsg(s);
          newMessages.push(m);
          await this.sqliteService.saveMessage({
            ...m,
            roomId: this.currentChat?.roomId,
          });
        } catch (err) {
          console.warn(
            'sqlite saveMessage failed for item',
            s?.key ?? s?.id ?? s,
            err
          );
        }
      }

      if (newMessages.length && newMessages[0].msgId === lastKey) {
        newMessages.shift();
      }

      if (newMessages.length === 0) {
        return;
      }

      for (const m of newMessages) {
        try {
          this.sqliteService.saveMessage({
            ...m,
            roomId: this.currentChat?.roomId as string,
          });
        } catch (e) {
          console.warn('sqlite saveMessage failed for', m.msgId, e);
        }
        currentArr.push(m);
      }

      currentArr.forEach((m) => this.pushMsgToChat(m));
      // currentMap.set(roomId, [...currentArr]);
      // this._messages$.next(currentMap);
      console.log('Current messages when some already exists->', currentArr);
    } catch (error) {
      console.error('syncMessagesWithServer error:', error);
    }
  }

  getMessages(): Observable<IMessage[] | undefined> {
    return this._messages$.asObservable().pipe(
      map(
        (messagesMap: Map<string, IMessage[]>) =>
          messagesMap
            .get(this.currentChat?.roomId as string)
            ?.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
            ?.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp), // convert timestamp to Date object
            })) || []
      )
    );
  }

  async getTotalMessages() {
    try {
      this._totalMessages = await this.sqliteService.getMessageCount(
        this.currentChat?.roomId as string
      );
    } catch (error) {
      console.error('Error #getTotalMessages -> ', error);
    }
  }

  async loadMessages(limit = 20) {
    try {
      const roomId = this.currentChat?.roomId as string;
      const currentOffset = this._offsets$.value.get(roomId) || 0;
      const newMessages = await this.sqliteService.getMessages(
        roomId,
        limit,
        currentOffset
      );

      if (!newMessages || newMessages.length === 0) {
        console.log('Not more messages');
        return;
      }

      const currentMessagesMap = new Map(this._messages$.value);
      const existingMessages = currentMessagesMap.get(roomId) || [];
      const mergedMessages = [...existingMessages, ...newMessages];
      currentMessagesMap.set(roomId, mergedMessages);
      this._messages$.next(currentMessagesMap);
      const newOffsetMap = new Map(this._offsets$.value);
      newOffsetMap.set(roomId, currentOffset + newMessages.length);
      this._offsets$.next(newOffsetMap);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  get hasMoreMessages() {
    return (
      (this._messages$.value.get(this.currentChat?.roomId as string)?.length ||
        0) < this._totalMessages
    );
  }

  async setArchiveConversation(
    roomIds: string[],
    isArchive: boolean = true
  ): Promise<void> {
    if (!this.senderId) {
      throw new Error('senderId not set');
    }
    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      console.error('RoomIds is not an array');
      return;
    }

    const existing = this.currentConversations;

    const db = getDatabase();

    const findLocalConv = (roomId: string) => {
      return (
        existing.find(
          (c) => c.roomId === roomId && c.isArchived != isArchive
        ) ?? null
      );
    };

    await Promise.all(
      roomIds.map(async (roomId) => {
        try {
          const chatRef = rtdbRef(db, `userchats/${this.senderId}/${roomId}`);
          const snap: DataSnapshot = await rtdbGet(chatRef);
          if (snap.exists()) {
            await rtdbUpdate(chatRef, { isArchived: isArchive });
          } else {
            const localConv: any = findLocalConv(roomId);
            const meta: Partial<IChatMeta> = {
              type: (localConv?.type as IChatMeta['type']) ?? 'private',
              lastmessageAt:
                localConv?.lastMessageAt instanceof Date
                  ? localConv.lastMessageAt.getTime()
                  : typeof localConv?.lastMessageAt === 'number'
                  ? Number(localConv.lastMessageAt)
                  : Date.now(),
              lastmessageType:
                (localConv?.lastMessageType as IChatMeta['lastmessageType']) ??
                'text',
              lastmessage: localConv?.lastMessage ?? '',
              unreadCount:
                typeof localConv?.unreadCount === 'number'
                  ? localConv.unreadCount
                  : Number(localConv?.unreadCount) || 0,
              isArchived: isArchive,
              isPinned: !!localConv?.isPinned,
              isLocked: !!localConv?.isLocked,
            };

            await rtdbSet(chatRef, meta);
          }
          const localConv = findLocalConv(roomId);
          if (localConv) {
            localConv.isArchived = isArchive;
            const idx = existing.findIndex((c) => c.roomId === roomId);
            if (idx > -1) {
              existing[idx] = {
                ...existing[idx],
                ...localConv,
              };
            } else {
              existing.push(localConv);
            }
          }
          this._conversations$.next(existing);
        } catch (err) {
          console.error('Failed to archive room:', roomId, err);
        }
      })
    );
  }

  // async setPinConversation(
  //   roomIds: string[],
  //   pin: boolean = true
  // ): Promise<void> {
  //   if (!this.senderId) {
  //     throw new Error('senderId not set');
  //   }

  //   if (!Array.isArray(roomIds) || roomIds.length === 0) {
  //     console.error('RoomIds is not an array');
  //     return;
  //   }

  //   const existing = this.currentConversations;
  //   const db = getDatabase();

  //   const findLocalConv = (roomId: string) => {
  //     return (
  //       existing.find((c) => c.roomId === roomId && c.isPinned != pin) ?? null
  //     );
  //   };

  //   await Promise.all(
  //     roomIds.map(async (roomId) => {
  //       try {
  //         const chatRef = rtdbRef(db, `userchats/${this.senderId}/${roomId}`);
  //         const snap: DataSnapshot = await rtdbGet(chatRef);

  //         if (snap.exists()) {
  //           await rtdbUpdate(chatRef, { isPinned: pin });
  //         } else {
  //           const localConv: any = findLocalConv(roomId);
  //           const meta: Partial<IChatMeta> = {
  //             type: (localConv?.type as IChatMeta['type']) ?? 'private',
  //             lastmessageAt:
  //               localConv?.lastMessageAt instanceof Date
  //                 ? localConv.lastMessageAt.getTime()
  //                 : typeof localConv?.lastMessageAt === 'number'
  //                 ? Number(localConv.lastMessageAt)
  //                 : Date.now(),
  //             lastmessageType:
  //               (localConv?.lastMessageType as IChatMeta['lastmessageType']) ??
  //               'text',
  //             lastmessage: localConv?.lastMessage ?? '',
  //             unreadCount:
  //               typeof localConv?.unreadCount === 'number'
  //                 ? localConv.unreadCount
  //                 : Number(localConv?.unreadCount) || 0,
  //             isPinned: pin,
  //             isArchived: !!localConv?.isArchived,
  //             isLocked: !!localConv?.isLocked,
  //           };

  //           await rtdbSet(chatRef, meta);
  //         }
  //         const localConv = findLocalConv(roomId);
  //         if (localConv) {
  //           localConv.isPinned = true;
  //           const idx = existing.findIndex((c) => c.roomId === roomId);
  //           if (idx > -1) {
  //             existing[idx] = { ...existing[idx], ...localConv };
  //           } else {
  //             existing.push(localConv);
  //           }
  //         }

  //         this._conversations$.next(existing);
  //       } catch (err) {
  //         console.error('Failed to pin room:', roomId, err);
  //       }
  //     })
  //   );
  // }

  async setPinConversation(
    roomIds: string[],
    pin: boolean = true
  ): Promise<void> {
    if (!this.senderId) {
      throw new Error('senderId not set');
    }

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      console.error('RoomIds is not an array');
      return;
    }

    const existing = this.currentConversations; // assumed array reference
    const db = getDatabase();

    const findLocalConv = (roomId: string) => {
      // find conversation that actually needs a change (isPinned != pin)
      return (
        existing.find((c) => c.roomId === roomId && c.isPinned !== pin) ?? null
      );
    };

    // do all updates in parallel, but only emit once after all done
    await Promise.all(
      roomIds.map(async (roomId) => {
        try {
          const chatRef = rtdbRef(db, `userchats/${this.senderId}/${roomId}`);
          const snap: DataSnapshot = await rtdbGet(chatRef);

          if (snap.exists()) {
            // update existing node with desired pinned value
            await rtdbUpdate(chatRef, { isPinned: pin });
          } else {
            // if there is no server node, create a meta using local conversation if available
            const localConv: any = findLocalConv(roomId);
            const meta: Partial<IChatMeta> = {
              type: (localConv?.type as IChatMeta['type']) ?? 'private',
              lastmessageAt:
                localConv?.lastMessageAt instanceof Date
                  ? localConv.lastMessageAt.getTime()
                  : typeof localConv?.lastMessageAt === 'number'
                  ? Number(localConv?.lastMessageAt)
                  : Date.now(),
              lastmessageType:
                (localConv?.lastMessageType as IChatMeta['lastmessageType']) ??
                'text',
              lastmessage: localConv?.lastMessage ?? '',
              unreadCount:
                typeof localConv?.unreadCount === 'number'
                  ? localConv.unreadCount
                  : Number(localConv?.unreadCount) || 0,
              isPinned: pin,
              isArchived: !!localConv?.isArchived,
              isLocked: !!localConv?.isLocked,
            };

            await rtdbSet(chatRef, meta);
          }

          // Update local conversation object (if present) — use `pin` not hard-coded true
          const localConv = findLocalConv(roomId);
          if (localConv) {
            localConv.isPinned = pin;
            // reflect in existing array (replace if found)
            const idx = existing.findIndex((c) => c.roomId === roomId);
            if (idx > -1) {
              existing[idx] = { ...existing[idx], ...localConv };
            } else {
              existing.push(localConv);
            }
          }
        } catch (err) {
          console.error('Failed to pin/unpin room:', roomId, err);
        }
      })
    );

    // Emit updated conversations once
    try {
      this._conversations$.next(existing);
    } catch (e) {
      // safe-guard if _conversations$ isn't available
      console.warn('Could not emit conversations update', e);
    }
  }

  async setLockConversation(
    roomIds: string[],
    lock: boolean = true
  ): Promise<void> {
    if (!this.senderId) {
      throw new Error('senderId not set');
    }

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      console.error('RoomIds is not an array');
      return;
    }

    const existing = this.currentConversations;

    // helper to find local conversation that isn't already locked
    const findLocalConv = (roomId: string) =>
      existing.find((c) => c.roomId === roomId && c.isLocked != lock) ?? null;

    await Promise.all(
      roomIds.map(async (roomId) => {
        try {
          const chatRef = rtdbRef(
            this.db,
            `userchats/${this.senderId}/${roomId}`
          );
          const snap: DataSnapshot = await rtdbGet(chatRef);

          if (snap.exists()) {
            // ✅ Update existing chat node
            await rtdbUpdate(chatRef, { isLocked: lock });
          } else {
            // ✅ Create a new chat metadata entry
            const localConv: any = findLocalConv(roomId);
            const meta: Partial<IChatMeta> = {
              type: (localConv?.type as IChatMeta['type']) ?? 'private',
              lastmessageAt:
                localConv?.lastMessageAt instanceof Date
                  ? localConv.lastMessageAt.getTime()
                  : typeof localConv?.lastMessageAt === 'number'
                  ? Number(localConv.lastMessageAt)
                  : Date.now(),
              lastmessageType:
                (localConv?.lastMessageType as IChatMeta['lastmessageType']) ??
                'text',
              lastmessage: localConv?.lastMessage ?? '',
              unreadCount:
                typeof localConv?.unreadCount === 'number'
                  ? localConv.unreadCount
                  : Number(localConv?.unreadCount) || 0,
              isLocked: lock,
              isPinned: !!localConv?.isPinned,
              isArchived: !!localConv?.isArchived,
            };

            await rtdbSet(chatRef, meta);
          }

          const localConv = findLocalConv(roomId);
          if (localConv) {
            localConv.isLocked = true;
            const idx = existing.findIndex((c) => c.roomId === roomId);
            if (idx > -1) {
              existing[idx] = { ...existing[idx], ...localConv };
            } else {
              existing.push(localConv);
            }
          }
          this._conversations$.next(existing);
        } catch (err) {
          console.error('Failed to lock room:', roomId, err);
        }
      })
    );
  }

  async bulkUpdate(updates: any) {
    const db = getDatabase();
    await rtdbUpdate(rtdbRef(db, '/'), updates);
  }

  async setPath(path: string, value: any) {
    const db = getDatabase();
    await rtdbSet(rtdbRef(db, path), value);
  }

  // =====================
  // ===== LISTENERS =====
  // Methods that attach realtime listeners (return unsubscribe handles or Observables)
  // =====================

  async listenRoomStream(
    roomId: string,
    handlers: {
      onAdd?: (msgKey: string, data: any, isNew: boolean) => void;
      onChange?: (msgKey: string, data: any) => void;
      onRemove?: (msgKey: string) => void;
    }
  ) {
    const roomRef = ref(this.db, `chats/${roomId}`);

    const snapshot = await get(roomRef);
    const existing = snapshot.val() || {};
    const existingKeys = new Set(Object.keys(existing));

    if (handlers.onAdd) {
      const items = Object.entries(existing).map(([k, v]: any) => ({
        key: k,
        val: v,
      }));
      items.sort((a, b) => (a.val.timestamp || 0) - (b.val.timestamp || 0));
      items.forEach((i) => handlers.onAdd!(i.key, i.val, false));
    }

    const addedHandler = onChildAdded(roomRef, (snap) => {
      const key = snap.key!;
      const val = snap.val();
      if (existingKeys.has(key)) {
        return;
      }
      handlers.onAdd?.(key, val, true); // isNew = true
    });

    const changedHandler = onChildChanged(roomRef, (snap) => {
      handlers.onChange?.(snap.key!, snap.val());
    });

    const removedHandler = onChildRemoved(roomRef, (snap) => {
      handlers.onRemove?.(snap.key!);
    });

    return () => {
      off(roomRef, 'child_added', addedHandler);
      off(roomRef, 'child_changed', changedHandler);
      off(roomRef, 'child_removed', removedHandler);
    };
  }

  /** Listen to messages in a room as an Observable of message arrays */
  listenForMessages(roomId: string): Observable<any[]> {
    return new Observable((observer) => {
      const messagesRef = ref(this.db, `chats/${roomId}`);
      const off = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messages = data
          ? Object.entries(data).map(([key, val]) => ({ key, ...(val as any) }))
          : [];
        observer.next(messages);
      });

      // return teardown
      return () => {
        try {
          off();
        } catch (e) {}
      };
    });
  }

  /** Listen to single pinned message for room (callback style) */
  listenToPinnedMessage(
    roomId: string,
    callback: (pinnedMessage: PinnedMessage | null) => void
  ) {
    const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
    return onValue(pinRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as PinnedMessage);
      } else {
        callback(null);
      }
    });
  }

  listenToUnreadCount(roomId: string, userId: string): Observable<number> {
    return new Observable((observer) => {
      const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
      const off = onValue(unreadRef, (snapshot) => {
        const val = snapshot.val();
        observer.next(val || 0);
      });
      return () => {
        try {
          off();
        } catch (e) {}
      };
    });
  }

  getUnreadCountOnce(roomId: string, userId: string): Promise<number> {
    return firstValueFrom(
      this.listenToUnreadCount(roomId, userId).pipe(take(1))
    );
  }

  // =====================
  // ====== ACTIONS ======
  // Core methods that perform writes / important operations
  // =====================

  async sendMessage(msg: Partial<IMessage & { attachment: IAttachment }>) {
    try {
      const { attachment, ...message } = msg;
      const roomId = this.currentChat?.roomId as string;
      const members = this.currentChat?.members || roomId.split('_');
      const encryptedText = await this.encryptionService.encrypt(
        msg.text as string
      );
      const meta: Partial<IChatMeta> = {
        type: this.currentChat?.type || 'private',
        lastmessageAt: message.timestamp as string,
        lastmessageType: attachment ? attachment.type : 'text',
        lastmessage: encryptedText || '',
      };

      for (const member of members) {
        const ref = rtdbRef(this.db, `userchats/${member}/${roomId}`);
        const idxSnap = await rtdbGet(ref);
        if (!idxSnap.exists()) {
          await rtdbSet(ref, {
            ...meta,
            isArhived: false,
            isPinned: false,
            isLocked: false,
          });
        } else {
          await rtdbUpdate(ref, { ...meta });
        }
      }

      const messagesRef = ref(this.db, `chats/${roomId}/${message.msgId}`);
      await rtdbSet(messagesRef, {
        ...message,
        roomId,
        text: encryptedText,
        ...(attachment && {
          attachment: { ...attachment, caption: encryptedText },
        }),
      });

      if (attachment) {
        this.sqliteService.saveAttachment(attachment);
        this.sqliteService.saveMessage({
          ...message,
          roomId,
          isMe: true,
        } as IMessage);
      } else {
        this.sqliteService.saveMessage({
          ...message,
          roomId,
          isMe: true,
        } as IMessage);
      }
      this.pushMsgToChat({ ...message, isMe: true });
    } catch (error) {
      console.error('Error in sending message', error);
    }
  }

  // Pinned message operations
  async pinMessage(message: PinnedMessage) {
    const key = message.roomId;
    const pinRef = ref(this.db, `pinnedMessages/${key}`);
    const snapshot = await get(pinRef);

    const pinData = {
      key: message.key,
      roomId: message.roomId,
      messageId: message.messageId,
      pinnedBy: message.pinnedBy,
      pinnedAt: Date.now(),
      scope: 'global',
    };

    if (snapshot.exists()) {
      await update(pinRef, pinData);
    } else {
      await set(pinRef, pinData);
    }
  }

  async getPinnedMessage(roomId: string): Promise<PinnedMessage | null> {
    try {
      const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
      const snapshot = await get(pinRef);

      if (snapshot.exists()) {
        return snapshot.val() as PinnedMessage;
      }
      return null;
    } catch (error) {
      console.error('Error getting pinned message:', error);
      return null;
    }
  }

  async unpinMessage(roomId: string) {
    try {
      const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
      await remove(pinRef);
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  }

  // Group and community operations
  // async createGroup(
  //   groupId: string,
  //   groupName: string,
  //   members: any[],
  //   currentUserId: string
  // ) {
  //   const groupRef = ref(this.db, `groups/${groupId}`);

  //   const currentUser = members.find((m) => m.user_id === currentUserId);
  //   const currentUserName = currentUser?.name || 'Unknown';

  //   const groupData = {
  //     name: groupName,
  //     groupId,
  //     description: 'Hey I am using Telldemm',
  //     createdBy: currentUserId,
  //     createdByName: currentUserName,
  //     createdAt: Date.now(),
  //     members: members.reduce((acc, member) => {
  //       acc[member.user_id] = {
  //         name: member.name,
  //         phone_number: member.phone_number,
  //         status: 'active',
  //         role: member.user_id === currentUserId ? 'admin' : 'member',
  //       };
  //       return acc;
  //     }, {}),
  //     membersCount: members.length,
  //   };

  //   await set(groupRef, groupData);
  // }

  async createGroup({
    groupId,
    groupName,
    members,
  }: {
    groupId: string;
    groupName: string;
    members: Array<{ userId: string; username: string; phoneNumber?: string }>;
  }) {
    try {
      if (!this.senderId) throw new Error('createGroup: senderId not set');
      const now = Date.now();
      const membersObj: Record<string, IGroupMember> = {};
      const memberIds = members.map((m) => m.userId);
      for (const m of members) {
        membersObj[m.userId] = {
          username: m.username,
          phoneNumber: m.phoneNumber ?? '',
          isActive: true,
        };
      }

      membersObj[this.senderId] = {
        username: this.authService.authData?.name as string,
        phoneNumber: this.authService.authData?.phone_number as string,
        isActive: true,
      };

      const groupDataForRTDB: IGroup = {
        roomId: groupId,
        title: groupName,
        description: 'Hey I am using Telldemm',
        adminIds: [this.senderId],
        createdBy: this.senderId,
        createdAt: now,
        members: membersObj,
        type: 'group',
        isArchived: false,
        isPinned: false,
        isLocked: false,
      };

      // --- 3️⃣ Chat metadata for /userchats/{userId}/{groupId}
      const chatMeta: IChatMeta = {
        type: 'group',
        lastmessageAt: now,
        lastmessageType: 'text',
        lastmessage: '',
        unreadCount: 0,
        isArchived: false,
        isPinned: false,
        isLocked: false,
      };

      const updates: Record<string, any> = {};
      updates[`/groups/${groupId}`] = groupDataForRTDB;

      for (const member of Object.keys(membersObj)) {
        updates[`/userchats/${member}/${groupId}`] = chatMeta;
      }
      await rtdbUpdate(rtdbRef(this.db, '/'), updates);

      const convo: IConversation = {
        roomId: groupId,
        title: groupName,
        type: 'group',
        avatar: '',
        members: memberIds,
        adminIds: [this.senderId],
        createdAt: new Date(now),
        updatedAt: new Date(now),
        lastMessage: chatMeta.lastmessage,
        lastMessageType: chatMeta.lastmessageType,
        lastMessageAt: new Date(now),
        unreadCount: 0,
        isArchived: false,
        isPinned: false,
        isLocked: false,
        isMyself: true,
      };

      try {
        await this.sqliteService.createConversation(convo);
      } catch (e) {
        console.warn('SQLite conversation save failed:', e);
      }
      // const existingConvs = this._conversations$.value;
      // this._conversations$.next([...existingConvs, convo]);
      console.log(
        `✅ Group "${groupName}" created successfully with ${members.length} members.`
      );
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  }

  async updateBackendGroupId(groupId: string, backendGroupId: string) {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${groupId}/backendGroupId`);
    await set(groupRef, backendGroupId);
  }

  async createCommunity(
    communityId: string,
    name: string,
    description: string,
    createdBy: string
  ): Promise<void> {
    try {
      const rawDb = getDatabase();
      const now = Date.now();
      const annGroupId = `comm_group_${now}_ann`;
      const generalGroupId = `comm_group_${now}_gen`;

      let creatorProfile: { name?: string; phone_number?: string } = {};
      try {
        const userSnap = await get(ref(rawDb, `users/${createdBy}`));
        if (userSnap.exists()) {
          const u = userSnap.val();
          creatorProfile.name = u.name || u.fullName || u.displayName || '';
          creatorProfile.phone_number =
            u.phone_number || u.mobile || u.phone || '';
        }
      } catch (err) {
        console.warn(
          'Failed to fetch creator profile, proceeding with fallback values',
          err
        );
      }

      const memberDetails = {
        name: creatorProfile.name || '',
        phone_number: creatorProfile.phone_number || '',
        role: 'admin',
        status: 'active',
        joinedAt: now,
      };

      const communityObj: any = {
        id: communityId,
        name,
        description: description || '',
        icon: '',
        createdBy,
        createdByName: creatorProfile.name,
        createdAt: now,
        privacy: 'invite_only',
        settings: {
          whoCanCreateGroups: 'admins',
          announcementPosting: 'adminsOnly',
        },
        admins: { [createdBy]: true },
        membersCount: 0,
        groups: { [annGroupId]: true, [generalGroupId]: true },
        members: { [createdBy]: memberDetails },
      };

      const annGroupObj = {
        id: annGroupId,
        name: 'Announcements',
        type: 'announcement',
        communityId: communityId,
        createdBy,
        createdByName: creatorProfile.name,
        createdAt: now,
        admins: { [createdBy]: true },
        members: { [createdBy]: memberDetails },
        membersCount: 0,
      };

      const genGroupObj = {
        id: generalGroupId,
        name: 'General',
        type: 'general',
        communityId: communityId,
        createdBy,
        createdByName: creatorProfile.name,
        createdAt: now,
        admins: { [createdBy]: true },
        members: { [createdBy]: memberDetails },
        membersCount: 0,
      };

      const updates: any = {};
      updates[`/communities/${communityId}`] = communityObj;
      updates[`/groups/${annGroupId}`] = annGroupObj;
      updates[`/groups/${generalGroupId}`] = genGroupObj;
      updates[
        `/usersInCommunity/${createdBy}/joinedCommunities/${communityId}`
      ] = true;

      await update(ref(rawDb), updates);
    } catch (err) {
      console.error('createCommunity error', err);
      throw err;
    }
  }

  // =====================
  // ====== QUERYING =====
  // Read-only helpers that fetch one-off data
  // =====================

  async getPinnedMessageOnce(roomId: string): Promise<PinnedMessage | null> {
    return this.getPinnedMessage(roomId);
  }

  async getGroupInfo(groupId: string): Promise<any> {
    const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

  async getGroupsForUser(userId: string): Promise<string[]> {
    const snapshot = await get(child(ref(this.db), 'groups'));
    const allGroups = snapshot.val();
    const userGroups: string[] = [];

    if (allGroups) {
      Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
        if (groupData.members?.[userId]) {
          userGroups.push(groupId);
        }
      });
    }

    return userGroups;
  }

  async fetchGroupWithProfiles(
    groupId: string
  ): Promise<{ groupName: string; groupMembers: any[] }> {
    try {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (!snapshot.exists()) {
        return { groupName: 'Group', groupMembers: [] };
      }

      const groupData = snapshot.val();
      const groupName = groupData.name || 'Group';

      const rawMembers = groupData.members || {};
      const members: any[] = Object.entries(rawMembers).map(
        ([userId, userData]: [string, any]) => ({
          user_id: userId,
          phone_number: userData?.phone_number,
          ...userData,
        })
      );

      const membersWithProfiles = await Promise.all(
        members.map(async (m) => {
          try {
            const res: any = await firstValueFrom(
              this.service.getUserProfilebyId(String(m.user_id))
            );
            m.avatar =
              res?.profile || m.avatar || 'assets/images/default-avatar.png';
            m.name = m.name || res?.name || `User ${m.user_id}`;
            m.publicKeyHex = res?.publicKeyHex || m.publicKeyHex || null;
            m.phone_number =
              m.phone_number || res?.phone_number || m.phone_number;
          } catch (err) {
            console.warn(
              `fetchGroupWithProfiles: failed to fetch profile for ${m.user_id}`,
              err
            );
            m.avatar = m.avatar || 'assets/images/default-avatar.png';
            m.name = m.name || `User ${m.user_id}`;
          }
          return m;
        })
      );

      return { groupName, groupMembers: membersWithProfiles };
    } catch (err) {
      console.error('fetchGroupWithProfiles error', err);
      return { groupName: 'Group', groupMembers: [] };
    }
  }

  async getGroupsInCommunity(communityId: string): Promise<string[]> {
    const snapshot = await get(
      child(ref(this.db), `communities/${communityId}/groups`)
    );
    const groups = snapshot.val();
    return groups ? Object.keys(groups) : [];
  }

  async getGroupsInCommunityWithInfo(communityId: string): Promise<any[]> {
    const groupIds = await this.getGroupsInCommunity(communityId);
    const result: any[] = [];

    for (const gid of groupIds) {
      const gSnap = await get(child(ref(this.db), `groups/${gid}`));
      if (gSnap.exists()) {
        const g = gSnap.val();
        result.push({
          id: gid,
          name: g.name,
          type: g.type || 'normal',
          createdBy: g.createdBy,
          createdAt: g.createdAt,
          membersCount:
            g.membersCount || (g.members ? Object.keys(g.members).length : 0),
        });
      }
    }

    return result;
  }

  async getUserCommunities(userId: string): Promise<string[]> {
    const snapshot = await get(
      child(ref(this.db), `usersInCommunity/${userId}/joinedCommunities`)
    );
    const communities = snapshot.val();
    return communities ? Object.keys(communities) : [];
  }

  async getCommunityInfo(communityId: string) {
    const snap = await get(child(ref(this.db), `communities/${communityId}`));
    return snap.exists() ? snap.val() : null;
  }

  async getGroupMembers(groupId: string): Promise<string[]> {
    const snapshot = await get(ref(this.db, `groups/${groupId}/members`));
    const membersObj = snapshot.val();
    return membersObj ? Object.keys(membersObj) : [];
  }

  // =====================
  // ====== UNREADS ======
  // Helpers for unread counters
  // =====================
  incrementUnreadCount(roomId: string, receiverId: string) {
    const unreadRef = ref(this.db, `unreadCounts/${roomId}/${receiverId}`);
    return runTransaction(unreadRef, (count) => (count || 0) + 1);
  }

  resetUnreadCount(roomId: string, userId: string) {
    const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
    return set(unreadRef, 0);
  }

  // =====================
  // ====== MARKING ======
  // Delivery/read status helpers
  // =====================
  markDelivered(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { delivered: true, deliveredAt: Date.now() });
  }

  markRead(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { read: true, readAt: Date.now() });
  }

  async markRoomAsRead(roomId: string, userId: string): Promise<number> {
    const db = getDatabase();
    const snap = await get(rtdbRef(db, `chats/${roomId}`));
    if (!snap.exists()) {
      try {
        await update(rtdbRef(db, `/unreadCounts/${roomId}`), { [userId]: 0 });
      } catch {}
      return 0;
    }

    const now = Date.now();
    const msgs = snap.val() || {};
    const multi: Record<string, any> = {};
    let changed = 0;

    Object.entries(msgs).forEach(([key, m]: any) => {
      const isForMe = String(m?.receiver_id) === String(userId);
      const alreadyRead = !!m?.read || (m?.readBy && m.readBy[userId]);

      if (isForMe && !alreadyRead) {
        multi[`chats/${roomId}/${key}/read`] = true;
        multi[`chats/${roomId}/${key}/readAt`] = now;
        multi[`chats/${roomId}/${key}/readBy/${userId}`] = now;
        changed++;
      }
    });

    multi[`unreadCounts/${roomId}/${userId}`] = 0;

    if (Object.keys(multi).length) {
      await update(rtdbRef(db, '/'), multi);
    }
    return changed;
  }

  async markManyRoomsAsRead(
    roomIds: string[],
    userId: string
  ): Promise<number> {
    let total = 0;
    for (const rid of roomIds) {
      try {
        total += await this.markRoomAsRead(rid, userId);
      } catch {}
    }
    return total;
  }

  async markRoomAsUnread(
    roomId: string,
    userId: string,
    minCount: number = 1
  ): Promise<void> {
    const db = getDatabase();

    let current = 0;
    try {
      const snap = await get(rtdbRef(db, `unreadCounts/${roomId}/${userId}`));
      current = snap.exists() ? Number(snap.val() || 0) : 0;
    } catch {}

    const updates: Record<string, any> = {};
    updates[`unreadChats/${userId}/${roomId}`] = true;
    if (current < minCount) {
      updates[`unreadCounts/${roomId}/${userId}`] = minCount;
    }

    await update(rtdbRef(db, '/'), updates);
  }

  async markManyRoomsAsUnread(
    roomIds: string[],
    userId: string,
    minCount: number = 1
  ): Promise<void> {
    const db = getDatabase();
    const updates: Record<string, any> = {};
    const nowMin = Math.max(1, minCount);

    for (const roomId of roomIds) {
      updates[`unreadChats/${userId}/${roomId}`] = true;
      updates[`unreadCounts/${roomId}/${userId}`] = nowMin;
    }

    await update(rtdbRef(db, '/'), updates);
  }

  async removeMarkAsUnread(roomId: string, userId: string): Promise<void> {
    const db = getDatabase();
    const updates: Record<string, any> = {};
    updates[`unreadChats/${userId}/${roomId}`] = null;
    updates[`unreadCounts/${roomId}/${userId}`] = 0;
    await update(rtdbRef(db, '/'), updates);
  }

  async removeManyMarksAsUnread(
    roomIds: string[],
    userId: string
  ): Promise<void> {
    const db = getDatabase();
    const updates: Record<string, any> = {};
    for (const roomId of roomIds) {
      updates[`unreadChats/${userId}/${roomId}`] = null;
      updates[`unreadCounts/${roomId}/${userId}`] = 0;
    }
    await update(rtdbRef(db, '/'), updates);
  }

  // =====================
  // ===== DELETIONS =====
  // Message / Chat / Group deletions (soft/hard)
  // =====================
  deleteMessage(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { isDeleted: true });
  }

  async deleteMessageForMe(
    roomId: string,
    key: string,
    userId: string
  ): Promise<void> {
    const db = getDatabase();
    const updates: any = {};
    updates[`/chats/${roomId}/${key}/deletedFor/${userId}`] = true;
    await update(ref(db), updates);
  }

  async deleteMessageForEveryone(
    roomId: string,
    key: string,
    performedBy: string,
    participantIds?: string[]
  ): Promise<void> {
    const db = getDatabase();
    const updates: any = {};

    updates[`/chats/${roomId}/${key}/deletedForEveryone`] = true;
    updates[`/chats/${roomId}/${key}/deletedBy`] = performedBy;
    updates[`/chats/${roomId}/${key}/deletedAt`] = Date.now();

    if (Array.isArray(participantIds)) {
      for (const uid of participantIds) {
        updates[`/chats/${roomId}/${key}/deletedFor/${uid}`] = true;
      }
    }

    await update(ref(db), updates);
  }

  async deleteChatForUser(roomId: string, userId: string): Promise<void> {
    try {
      const db = getDatabase();
      const chatsRef = rtdbRef(db, `chats/${roomId}`);
      const snapshot = await get(chatsRef);

      if (snapshot.exists()) {
        const messages = snapshot.val();
        const updates: any = {};

        Object.keys(messages).forEach((messageKey) => {
          updates[`chats/${roomId}/${messageKey}/deletedFor/${userId}`] = true;
        });

        await update(rtdbRef(db), updates);
      }

      await update(rtdbRef(db), {
        [`unreadCounts/${roomId}/${userId}`]: 0,
      });
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      throw error;
    }
  }

  async deleteChatPermanently(roomId: string): Promise<void> {
    try {
      const db = getDatabase();
      const updates: any = {};
      updates[`chats/${roomId}`] = null;
      updates[`unreadCounts/${roomId}`] = null;
      updates[`typing/${roomId}`] = null;
      await update(rtdbRef(db), updates);
    } catch (error) {
      console.error('❌ Error permanently deleting chat:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const db = getDatabase();
      const updates: any = {};
      updates[`groups/${groupId}`] = null;
      updates[`chats/${groupId}`] = null;
      updates[`unreadCounts/${groupId}`] = null;
      updates[`typing/${groupId}`] = null;
      await update(rtdbRef(db), updates);
    } catch (error) {
      console.error('❌ Error deleting group:', error);
      throw error;
    }
  }

  // =====================
  // ====== STATE ========
  // Forward message storage and selected message info used by UI
  // =====================
  setForwardMessages(messages: any[]) {
    this.forwardMessages = messages;
  }

  getForwardMessages() {
    return this.forwardMessages;
  }

  clearForwardMessages() {
    this.forwardMessages = [];
  }

  setSelectedMessageInfo(msg: any) {
    this._selectedMessageInfo = msg;
  }

  getSelectedMessageInfo(clearAfterRead = false): any {
    const m = this._selectedMessageInfo;
    if (clearAfterRead) this._selectedMessageInfo = null;
    return m;
  }

  // =====================
  // ======= LEGACY ======
  // commented out / previously used helpers preserved for reference
  // =====================

  // // async deleteChatForUser(userId: string, chat: { receiver_Id: string; group?: boolean; isCommunity?: boolean }) { ... }
}
