import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {

  constructor() {}

  async setItem(key: string, value: string): Promise<void> {
    await SecureStoragePlugin.set({ key, value });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch (error) {
      console.warn('Item not found:', key);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    await SecureStoragePlugin.remove({ key });
  }

  async clearAll(): Promise<void> {
    await SecureStoragePlugin.clear();
  }
}
