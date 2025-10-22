import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AttachmentPreviewPage } from '../pages/attachment-preview/attachment-preview.page';

/** ----------------- INTERFACES ----------------- **/
export interface IUser {
  userId: string;
  username: string;
  phoneNumber: string;
  lastSeen?: Date;
  avatar?: string;
  status?: string;   //mapping of status
  isOnPlatform?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  msgId: string;
  roomId: string;
  sender: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'other';
  // isTranslated : boolean;   // use in future
  // translatedIn : string;
  //translatedText : string;
  text?: string;
  localUrl?: string;
  cdnUrl?: string;
  mediaId?: string;
  isMe?: boolean;
  status?: 'failed' | 'pending' | 'sent' | 'delivered' | 'read';
  timestamp: string | Date | number;
  deletedFor?: {
    everyone: boolean;
    users: [];
  };
  reactions: { userId: string; emoji: string | null }[];
  replyToMsgId: string;
  isEdit: boolean;
  isForwarded?: boolean;
  receipts?: {
    read: {
      status: boolean;
      readBy: {
        userId: string;
        timestamp: string | number | Date;
      }[];
    };
    delivered: {
      status: boolean;
      deliveredTo: {
        userId: string;
        timestamp: string | number | Date;
      }[];
    };
  };
}

export interface IAttachment {
  type: 'audio' | 'video' | 'image' | 'pdf' | 'other';
  mediaId?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  caption?: string;
  localUrl?: string;
  cdnUrl?: string;
}

export interface IConversation {
  roomId: string;
  title?: string;
  phoneNumber?: string;
  type: 'private' | 'group' | 'community';
  isMyself?: boolean;
  avatar?: string;
  members?: string[];
  adminIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
  isArchived: boolean;
  isPinned: boolean;
  isLocked: boolean;
}
export interface IGroup {
  roomId: string;
  title?: string;
  type: 'group';
  avatar?: string;
  description: string;
  members?: Record<string, IGroupMember>;
  adminIds?: string[];
  createdBy: string;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageAt?: Date | string | number;
  unreadCount?: number;
  isArchived: boolean;
  isPinned: boolean;
  isLocked: boolean;
}

export interface IGroupMember {
  username: string;
  phoneNumber: string;
  isActive: boolean;
}
export interface IOpState {
  id: string;
  isLoading: boolean;
  isError: string | null;
  isSuccess: boolean | null;
}

export interface CreateConversationInput extends IConversation {}

const DB_NAME = 'telldemm.db';

/** ----------------- SCHEMAS ----------------- **/
const TABLE_SCHEMAS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      phoneNumber TEXT UNIQUE NOT NULL,
      lastSeen TEXT,
      avatar TEXT,
      status TEXT,
      isOnPlatform INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT 
    );
  `,
  conversations: `
    CREATE TABLE IF NOT EXISTS conversations (
      roomId TEXT PRIMARY KEY,
      title TEXT,
      phoneNumber TEXT,
      type TEXT,
      isMyself INTEGER DEFAULT 0,
      avatar TEXT,
      members TEXT,
      adminIds TEXT,
      isArchived INTEGER DEFAULT 0,
      isPinned INTEGER DEFAULT 0,
      isLocked INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `,
  attachments: `
    CREATE TABLE IF NOT EXISTS attachments (
      mediaId INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      fileName TEXT,
      mimeType TEXT,
      fileSize TEXT,
      caption TEXT,
      localUrl TEXT,
      cdnUrl TEXT
    );
  `,
  messages: `
   CREATE TABLE IF NOT EXISTS messages (
    msgId TEXT PRIMARY KEY,
    roomId TEXT NOT NULL,
    sender TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    text TEXT,
    isMe INTEGER DEFAULT 0,
    status TEXT,
    timestamp TEXT NOT NULL,
    receipts TEXT,
    replyToMsgId TEXT,
    isEdit INTEGER DEFAULT 0,
    reactions TEXT,
    deletedFor TEXT,
    mediaId TEXT,
    FOREIGN KEY (roomId) REFERENCES conversations(roomId),
    FOREIGN KEY (mediaId) REFERENCES attachments(mediaId)
  );
  `,
};

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private isInitialized: boolean = false;
  private sqliteConnection: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private operationStates = new Map<string, BehaviorSubject<IOpState>>();

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    if (Capacitor.getPlatform() === 'web') {
      defineCustomElements(window);
    }
  }

  async init(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.warn('DB Already initialized!');
        return;
      }

      if (Capacitor.getPlatform() === 'web') {
        await this.sqliteConnection.initWebStore();
      }
      const isConn = (await this.sqliteConnection.isConnection(DB_NAME, false))
        .result;
      if (isConn) {
        await this.sqliteConnection.closeConnection(DB_NAME, false);
      }
      this.db = await this.sqliteConnection.createConnection(
        DB_NAME,
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();

      await this.initDB();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ SQLite init error:', error);
    }
  }

  /** ----------------- DB INIT ----------------- **/
  private async initDB() {
    try {
      for (const schema of Object.values(TABLE_SCHEMAS)) {
        await this.db.execute(schema);
        console.log('Table created for ', schema);
      }
      console.info('SQLite tables created! ✅');
    } catch (err) {
      console.error('DB init error:', err);
    }
  }

  /** ----------------- OP STATE ----------------- **/
  private setOpState(id: string, partial: Partial<IOpState>) {
    if (!this.operationStates.has(id)) {
      this.operationStates.set(
        id,
        new BehaviorSubject<IOpState>({
          id,
          isLoading: false,
          isError: null,
          isSuccess: null,
        })
      );
    }
    const current = this.operationStates.get(id)!.value;
    this.operationStates.get(id)!.next({ ...current, ...partial });
  }

  private async withOpState<T>(
    id: string,
    action: () => Promise<T>,
    defaultValue?: T
  ): Promise<T> {
    this.setOpState(id, { isLoading: true, isError: null, isSuccess: null });
    try {
      if (!this.isInitialized) throw new Error('DB not initialized');
      const result = await action();
      this.setOpState(id, { isLoading: false, isSuccess: true });
      return result;
    } catch (err: any) {
      console.error(`#SQLiteService.${id} Error:`, err);
      this.setOpState(id, {
        isLoading: false,
        isError: err?.message || 'Unknown error',
      });
      return defaultValue as T;
    }
  }

  getOpState$(id: string) {
    if (!this.operationStates.has(id)) {
      this.operationStates.set(
        id,
        new BehaviorSubject<IOpState>({
          id,
          isLoading: false,
          isError: null,
          isSuccess: null,
        })
      );
    }
    return this.operationStates.get(id)!.asObservable();
  }

  /** ----------------- HELPERS ----------------- **/
  private toDate(value?: string | null): Date | undefined {
    return value ? new Date(Number(value)) : undefined;
  }

  /** ----------------- CONTACTS ----------------- **/
  async upsertContact(contact: IUser & { isOnPlatform?: boolean }) {
    return this.withOpState('upsertContact', async () => {
      const sql = `
        INSERT INTO users (userId, phoneNumber, username, avatar, status, lastSeen, isOnPlatform, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(userId) DO UPDATE SET
        phoneNumber = excluded.phoneNumber,
        username = excluded.username,
        avatar = excluded.avatar,
        status = excluded.status,
        lastSeen = excluded.lastSeen,
        isOnPlatform = excluded.isOnPlatform,
        updatedAt = datetime('now')
      `;
      const params = [
        contact.userId,
        contact.phoneNumber,
        contact.username || contact.phoneNumber,
        contact.avatar || null,
        contact.status || null,
        contact.lastSeen?.toISOString() || null,
        contact.isOnPlatform ? 1 : 0,
      ];
      await this.db.run(sql, params);
    });
  }

  async upsertContacts(contacts: (IUser & { isOnPlatform?: boolean })[]) {
    return this.withOpState('upsertContacts', async () => {
      for (const c of contacts) {
        await this.upsertContact(c);
      }
      console.info('Upserted contacts!');
    });
  }

  async getContacts(onlyPlatformUsers = false): Promise<IUser[]> {
    return this.withOpState(
      'getContacts',
      async () => {
        const sql = onlyPlatformUsers
          ? `SELECT * FROM users WHERE isOnPlatform = 1 ORDER BY username ASC`
          : `SELECT * FROM users ORDER BY username ASC`;
        const res = await this.db.query(sql);
        return (
          res.values?.map((c) => ({
            ...c,
            _id: c.userId,
            isOnPlatform: !!c.isOnPlatform,
            lastSeen: this.toDate(c.lastSeen),
            createdAt: this.toDate(c.createdAt),
            updatedAt: this.toDate(c.updatedAt),
          })) ?? []
        );
      },
      []
    );
  }

  async getContactByPhone(phoneNumber: string): Promise<IUser | null> {
    return this.withOpState(
      'getContactByPhone',
      async () => {
        const res = await this.db.query(
          `SELECT * FROM users WHERE phoneNumber = ?`,
          [phoneNumber]
        );
        const c = res.values?.[0];
        if (!c) return null;
        return {
          ...c,
          // _id: c.userId,
          isOnPlatform: !!c.isOnPlatform,
          lastSeen: this.toDate(c.lastSeen),
          createdAt: this.toDate(c.createdAt),
          updatedAt: this.toDate(c.updatedAt),
        };
      },
      null
    );
  }

  async getContactById(id: string): Promise<IUser | null> {
    return this.withOpState(
      'getContactById',
      async () => {
        const res = await this.db.query(
          `SELECT * FROM users WHERE userId = ?`,
          [id]
        );
        const c = res.values?.[0];
        if (!c) return null;
        return {
          ...c,
          // _id: c.userId,
          isOnPlatform: !!c.isOnPlatform,
          lastSeen: this.toDate(c.lastSeen),
          createdAt: this.toDate(c.createdAt),
          updatedAt: this.toDate(c.updatedAt),
        };
      },
      null
    );
  }

  async updateContactMetadata(
    id: string,
    updates: Partial<Pick<IUser, 'avatar' | 'status' | 'username' | 'lastSeen'>>
  ) {
    return this.withOpState('updateContactMetadata', async () => {
      const setClauses: string[] = [];
      const params: any[] = [];
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          setClauses.push(`${key} = ?`);
          params.push(value instanceof Date ? value.toISOString() : value);
        }
      });
      if (!setClauses.length) return;
      params.push(id);
      await this.db.run(
        `UPDATE users SET ${setClauses.join(
          ', '
        )}, updatedAt = datetime('now') WHERE userId = ?`,
        params
      );
    });
  }

  async deleteContact(phoneNumber: string) {
    return this.withOpState('deleteContact', async () => {
      await this.db.run(`DELETE FROM users WHERE phoneNumber = ?`, [
        phoneNumber,
      ]);
    });
  }

  async deleteAllContacts() {
    return this.withOpState('deleteAllContacts', async () => {
      await this.db.execute('DELETE FROM users');
    });
  }

  /** ----------------- CONVERSATIONS ----------------- **/
  async createConversation(input: CreateConversationInput) {
    return this.withOpState('createConversation', async () => {
      const sql = `
        INSERT INTO conversations
        (roomId, title, type, isMyself, avatar, members, adminIds, phoneNumber,isArchived, isPinned, isLocked, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,  datetime('now'), datetime('now'))
        ON CONFLICT(roomId) DO UPDATE SET
        title = excluded.title,
        type = excluded.type,
        isMyself = excluded.isMyself,
        avatar = excluded.avatar,
        members = excluded.members,
        adminIds = excluded.adminIds,
        isArchived = excluded.isArchived,
        isPinned = excluded.isPinned,
        isLocked = excluded.isLocked,
        updatedAt = datetime('now')
      `;
      await this.db.run(sql, [
        input.roomId,
        input.title,
        input.type,
        input.isMyself ? 1 : 0,
        input.avatar || null,
        JSON.stringify(input.members || []),
        JSON.stringify(input.adminIds || []),
        input.phoneNumber || null,
        input.isArchived ? 1 : 0,
        input.isPinned ? 1 : 0,
        input.isLocked ? 1 : 0,
      ]);
    });
  }

  async getConversation(roomId: string): Promise<IConversation | null> {
    return this.withOpState(
      'getConversation',
      async () => {
        const res = await this.db.query(
          `SELECT * FROM conversations WHERE roomId = ?`,
          [roomId]
        );
        const row = res.values?.[0];
        if (!row) return null;
        return {
          ...row,
          members: row.members ? JSON.parse(row.members) : [],
          adminIds: row.adminIds ? JSON.parse(row.adminIds) : [],
          createdAt: this.toDate(row.createdAt),
          updatedAt: this.toDate(row.updatedAt),
        };
      },
      null
    );
  }

  async getConversations(): Promise<IConversation[]> {
    return this.withOpState(
      'getConversations',
      async () => {
        const sql = `
        SELECT c.*, 
        m.text AS lastMessage,
        m.type AS lastMessageType,
        m.timestamp AS lastMessageAt,
        (
          SELECT COUNT(um.msgId) FROM messages um 
          WHERE um.roomId = c.roomId AND um.isMe = 0 AND um.status = 'delivered'
        ) AS unreadCount
        FROM conversations c
        LEFT JOIN messages m 
        ON m.roomId = c.roomId
        AND m.timestamp = (SELECT MAX(timestamp) FROM messages WHERE roomId = c.roomId)
        ORDER BY c.updatedAt DESC
      `;
        const res = await this.db.query(sql);
        return (
          res.values?.map((c) => ({
            ...c,
            type: c.type,
            isMyself: !!c.isMyself,
            isArchived: !!c.isArchived,
            isPinned: !!c.isPinned,
            isLocked: !!c.isLocked,
            members: c.members ? JSON.parse(c.members) : [],
            adminIds: c.adminIds ? JSON.parse(c.adminIds) : [],
            lastMessageAt: this.toDate(c.lastMessageAt),
            createdAt: this.toDate(c.createdAt),
            updatedAt: this.toDate(c.updatedAt),
          })) ?? []
        );
      },
      []
    );
  }

  async deleteConversation(roomId: string) {
    return this.withOpState('deleteConversation', async () => {
      await this.db.run('DELETE FROM messages WHERE roomId = ?', [roomId]);
      await this.db.run('DELETE FROM conversations WHERE roomId = ?', [roomId]);
    });
  }

  async deleteConversations(roomIds: string[]) {
    return this.withOpState('deleteConversations', async () => {
      if (!roomIds.length) return;
      const placeholders = roomIds.map(() => '?').join(', ');
      await this.db.run(
        `DELETE FROM messages WHERE roomId IN (${placeholders})`,
        roomIds
      );
      await this.db.run(
        `DELETE FROM conversations WHERE roomId IN (${placeholders})`,
        roomIds
      );
    });
  }

  /** ----------------- MESSAGES ----------------- **/
  async saveMessage(message: IMessage) {
    return this.withOpState('saveMessage', async () => {
      const sql = `
        INSERT INTO messages 
        (msgId, roomId, sender, type, text,mediaId, isMe, status, timestamp, receipts, deletedFor, replyToMsgId, reactions, isEdit )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        message.msgId,
        message.roomId,
        message.sender,
        message.type || 'text',
        message.text || null,
        message.mediaId || null,
        message.isMe ? 1 : 0,
        message.status,
        String(message.timestamp),
        JSON.stringify(message.receipts || {}),
        JSON.stringify(message.deletedFor || {}),
        message.replyToMsgId || '',
        JSON.stringify(message.reactions || []),
        !!message.isEdit ? 1 : 0,
      ];
      await this.db.run(sql, params);
    });
  }

  saveAttachment(attachment: IAttachment) {
    return this.withOpState('saveAttachment', async () => {
      const query = `INSERT INTO attachments (mediaId, type, fileName, mimeType, fileSize, caption, localUrl, cdnUrl)
      VALUES(?,?,?,?,?,?,?,?) `;
      await this.db.run(query, [
        attachment.mediaId || '',
        attachment.type || '',
        attachment.fileName || '',
        attachment.mimeType || '',
        attachment.fileSize || '',
        attachment.caption || '',
        attachment.localUrl || '',
        attachment.cdnUrl || '',
      ]);
    });
  }

  async getMessages(
    roomId: string,
    limit = 20,
    offset = 0
  ): Promise<IMessage[]> {
    return this.withOpState(
      'getMessages',
      async () => {
        const sql = `SELECT * FROM messages WHERE roomId = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        const res = await this.db.query(sql, [roomId, limit, offset]);
        return (
          res.values?.reverse().map((msg) => ({
            ...msg,
            receipts: JSON.parse(msg.receipts || '{}'),
            reactions: JSON.parse(msg.reactions || '[]'),
            deletedFor: JSON.parse(msg.deletedFor || '{}'),
            isMe: !!msg.isMe,
            isEdit: !!msg.isEdit,
            timestamp: this.toDate(msg.timestamp),
          })) ?? []
        );
      },
      []
    );
  }

  async getMessage(msgId: string): Promise<IMessage | null> {
    return this.withOpState(
      'getMessage',
      async () => {
        const res = await this.db.query(
          `SELECT * FROM messages WHERE msgId = ?`,
          [msgId]
        );
        const m = res.values?.[0];
        if (!m) return null;
        return {
          ...m,
          receipts: JSON.parse(m.receipts || '{}'),
          isMe: m.isMe === 1,
          timestamp: this.toDate(m.timestamp),
        };
      },
      null
    );
  }

  async deleteMessages(msgIds: string[]) {
    return this.withOpState('deleteMessages', async () => {
      if (msgIds.length > 0) {
        const placeholders = msgIds.map(() => '?').join(', ');
        await this.db.run(
          `DELETE FROM messages WHERE msgId IN (${placeholders})`,
          msgIds
        );
      }
    });
  }

  async updateMessageStatus(msgId: string, status: IMessage['status']) {
    return this.withOpState('updateMessageStatus', async () => {
      await this.db.run(`UPDATE messages SET status = ? WHERE msgId = ?`, [
        status,
        msgId,
      ]);
    });
  }

  async updateMessageReceipts(msgId: string, receipt: IMessage['receipts']) {
    return this.withOpState('updateMessageReceipts', async () => {
      await this.db.run(`UPDATE messages SET receipts = ? WHERE msgId = ?`, [
        JSON.stringify(receipt),
        msgId,
      ]);
    });
  }

  async getMessageCount(roomId: string): Promise<number> {
    return this.withOpState(
      'getMessageCount',
      async () => {
        const res = await this.db.query(
          `SELECT COUNT(*) as count FROM messages WHERE roomId = ?`,
          [roomId]
        );
        return res.values?.[0]?.count ?? 0;
      },
      0
    );
  }

  /** ----------------- UTILITIES ----------------- **/
  async resetDB() {
    return this.withOpState('resetDB', async () => {
      for (const table of ['users', 'conversations', 'messages']) {
        await this.db.execute(`DROP TABLE IF EXISTS ${table}`);
      }
      for (const schema of Object.values(TABLE_SCHEMAS)) {
        await this.db.execute(schema);
      }
      //console.log('DB reset complete ✅');
    });
  }

  /**
   * Helper: Convert Blob → Base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Helper: Convert Base64 → Blob
   */
  private base64ToBlob(base64Data: string, contentType = ''): Blob {
    const byteCharacters = atob(base64Data.split(',')[1] || base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  /**
   * Close the database connection
   */
  async closeConnection(): Promise<void> {
    try {
      await this.sqliteConnection.closeConnection(DB_NAME, false);
    } catch (error) {
      console.error('❌ Error closing DB connection:', error);
    }
  }
}
