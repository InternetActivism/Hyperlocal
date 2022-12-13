import { MMKV } from 'react-native-mmkv';
import { sendMessage } from '../bridgefy-link';
import { createNewMessage, getConversationHistory } from './messages';

export const storage = new MMKV();

/*
  CurrentUserInfo 
  Stored in MMKV under key `current_user_info`
*/

export const CURRENT_USER_INFO_KEY = () => 'current_user_info';
export interface CurrentUserInfo {
  userID: string;
  username: string;
  nickname: string;
  userFlags: number;
  privacy: number; // 0 = public, 1 = private
  verified: boolean;
  dateCreated: number; // unix timestamp
  dateUpdated: number; // unix timestamp
  sdkValidated?: boolean;
}

/*
  ContactInfo 
  Requires contactID to fetch.
  Stored in MMKV under key `contact-{contactid}`.
*/

export const CONTACT_INFO_KEY = (contactID: string) => `contact-${contactID}`;
export interface ContactInfo {
  contactID: string;
  username: string;
  nickname: string;
  contactFlags: number;
  verified: boolean;
  lastSeen: number;
  firstMsgPointer?: string;
  lastMsgPointer?: string;
}

/*
  ContactArray 
  Stored in MMKV under key `contacts_array`.
*/

export const CONTACT_ARRAY_KEY = () => 'contact_array';
export interface ContactArray {
  contacts: string[];
  lastUpdated: number;
}

/*
  StoredDirectMessage 
  Requires messageID to fetch.
  Stored in MMKV under key `message-{messageid}`.
*/

export const STORED_DIRECT_MESSAGE_KEY = (messageID: string) => `message-${messageID}`;
export interface StoredDirectMessage {
  messageID: string;
  contactID: string;
  nextMsgPointer?: string;
  prevMsgPointer?: string;
  isReceiver: boolean;
  typeFlag: number; // 0 = normal message, 1 = username update
  statusFlag: number; // 0 = success, 1 = pending, 2 = failed, 3 = deleted
  content: string;
  createdAt: number; // unix timestamp
  receivedAt: number; // unix timestamp
}

/*

  Other interfaces

*/

/*
  CachedConversation 
  Used in memory to store a conversation for fast access.
*/
export interface CachedConversation {
  contactID: string;
  history: StoredDirectMessage[];
  lastUpdated: number;
}

/*
  RawMessage 
  Format that we stringify and send over mesh network.
*/
export interface RawMessage {
  content: string;
  flags: number;
  createdAt: number; // unix timestamp
}

/* 

  Misc functions

*/

export function getContactsArray(): string[] {
  const contactArray = storage.getString(CONTACT_ARRAY_KEY());
  if (contactArray) {
    try {
      return JSON.parse(contactArray).contacts;
    } catch (e) {
      console.log(contactArray);
      throw e;
    }
  }
  return [];
}

export function addContactToArray(contactID: string): string[] {
  const contacts = getContactsArray();
  contacts.push(contactID);
  const contactArray = JSON.stringify({ contacts, lastUpdated: Date.now() });
  storage.set(CONTACT_ARRAY_KEY(), contactArray);
  return contacts;
}

export function wipeDatabase() {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

// Assumes that the contact exists.
export async function sendMessageWrapper(contactID: string, message: RawMessage): Promise<string> {
  const messageRaw = JSON.stringify(message);
  const messageID = await sendMessage(messageRaw, contactID);

  console.log('(sendMessageWrapper) Creating new message');
  createNewMessage(contactID, messageID, {
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: message.flags,
    statusFlag: 1, // 0 = success, 1 = pending, 2 = failed, 3 = deleted
    content: message.content,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}

// Updates the conversation cache with a new message history for a given contact.
// TODO: Make this more efficient by not wiping the entire cache.
export function updateConversationCache(
  contactID: string,
  history: StoredDirectMessage[],
  cache: Map<string, CachedConversation>
): Map<string, CachedConversation> {
  const newCache = new Map(cache);
  newCache.set(contactID, {
    contactID,
    history,
    lastUpdated: Date.now(),
  });
  return newCache;
}

export function createConversationCache(): Map<string, CachedConversation> {
  const contacts = getContactsArray();
  const cache: Map<string, CachedConversation> = new Map();
  for (const contactID of contacts) {
    cache.set(contactID, {
      contactID,
      history: getConversationHistory(contactID),
      lastUpdated: Date.now(),
    });
  }
  return cache;
}
