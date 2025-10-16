import { Injectable } from '@angular/core';
import { Contacts, GetContactsOptions } from '@capacitor-community/contacts';
import { ApiService } from './api/api.service';
import { IDeviceContact } from 'src/types';
import { IUser } from './sqlite.service';



@Injectable({
  providedIn: 'root',
})
export class ContactSyncService {
  contacts: any;
  constructor(private apiService: ApiService) { }

  async getDevicePhoneNumbers(): Promise<{ username: string, phoneNumber: string }[]> {
    try {
      const permission = await Contacts.requestPermissions();

      if (permission.contacts === 'granted') {
        const options: GetContactsOptions = {
          projection: {
            name: true,
            phones: true,
          },
        };

        const { contacts } = await Contacts.getContacts(options);
        //     const formattedContacts: IDeviceContact[] = [];
        // const uniqueNumbers = new Set<string>();

        const formatted: { name: string, phoneNumbers: string[], emailAddresses: string[] }[] = contacts.map((c) => ({
          name: c.name?.display || '',
          phoneNumbers: c.phones?.map((p: any) => p.number) || [],
          emailAddresses: c.emails?.map((e: any) => e.email) || [],
        }));

        const normalized = formatted.flatMap((con) =>
          con.phoneNumbers.map((num) => ({
            username: con.name,
            phoneNumber: num.replace(/^\+91/, "").replace(/\s|[-()]/g, ""),
          }))
        );

        return normalized

      } else {
        console.warn('Permission not granted for contacts');
        return [];
      }
    } catch (error) {
      console.error('Error loading contacts', error);
      return [];
    }
  }

  async getMatchedUsers(): Promise<IUser[]> {
    const formattedContacts = await this.getDevicePhoneNumbers();
    const nameNumberMap = formattedContacts.reduce((map, contact) => {
      map.set(contact.phoneNumber.slice(-10), contact.username)
      return map;
    }, new Map<string, string>())
    return new Promise((resolve, reject) => {
      this.apiService.getAllUsers().subscribe({
        next: (users) => {
          try {

            const matched = (users || []).map((user: any) => {
              const cleanedUserNumber = user.phone_number.replace(/\D/g, '');
              if (cleanedUserNumber.length >= 10) {
                const userLast10 = cleanedUserNumber.slice(-10);
                const formattedUser = '+91' + userLast10;

                if (nameNumberMap.has(userLast10)) {
                  return {
                    phoneNumber: formattedUser,
                    userId: user.user_id,
                    avatar: user.profile_picture_url,
                    username: nameNumberMap.get(userLast10) as string,
                    isOnPlatform: true
                  } as IUser
                }
              }
              return null;
            }).filter(user => user !== null);

            resolve(matched);
          } catch (error) {
            console.error("get matched users", error)
            reject(error);
          }
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          reject(err);
        },
      });
    });
  }


}