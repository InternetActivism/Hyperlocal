import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// ----------------- MMKV DATABASE SCHEMA ------------------ //

/*
  CurrentUserInfo
  Stored in MMKV under key `current_user_info`
*/

export const CURRENT_USER_INFO_KEY = 'current_user_info';
export interface CurrentUserInfo {
  userID: string | null; // null if bridgefy is not initialized
  nickname: string;
  userFlags: number;
  privacy: number; // 0 = public, 1 = private
  verified: boolean;
  dateCreated: number; // unix timestamp
  dateUpdated: number; // unix timestamp
  isOnboarded: boolean;
}

/*
  ContactInfo
  Requires contactID to fetch.
  Stored in MMKV under key `contact-{contactid}`.
*/

export const CONTACT_INFO_KEY = (contactID: string) => `contact-${contactID}`;
export interface ContactInfo {
  contactID: string;
  nickname: string;
  contactFlags: number;
  verified: boolean;
  lastSeen: number;
  unreadCount: number;
  firstMsgPointer?: string;
  lastMsgPointer?: string;
}

/*
  PublicChatInfo 
  Stored in MMKV under key `publicchat`.
*/

export const PUBLIC_CHAT_INFO_KEY = () => 'publicchat';
export interface PublicChatInfo {
  lastUpdated: number;
  firstMsgPointer?: string;
  lastMsgPointer?: string;
}

/*
  ContactArray 
  Stored in MMKV under key `contacts_array`.
*/

export const CONTACT_ARRAY_KEY = 'contact_array';
export interface ContactArray {
  contacts: string[];
  lastUpdated: number;
}

/*
  StoredChatMessage
  Requires messageID to fetch.
  Stored in MMKV under key `message-{messageid}`.
*/

export const STORED_DIRECT_MESSAGE_KEY = (messageID: string) => `message-${messageID}`;
export interface StoredChatMessage {
  messageID: string;
  contactID: string;
  nextMsgPointer?: string;
  prevMsgPointer?: string;
  isReceiver: boolean;
  typeFlag: number; // 0 = normal message, 1 = nickname update
  statusFlag: number; // 0 = success, 1 = pending, 2 = failed, 3 = deleted
  content: string;
  createdAt: number; // unix timestamp
  receivedAt: number; // unix timestamp
}

/*
  StoredPublicMessage 
  Requires messageID to fetch.
  Stored in MMKV under key `publicmessage-{messageid}`.
*/

export const STORED_PUBLIC_MESSAGE_KEY = (messageID: string) => `publicmessage-${messageID}`;
export interface StoredPublicChatMessage {
  messageID: string;
  senderID: string;
  nickname: string;
  nextMsgPointer?: string;
  prevMsgPointer?: string;
  isReceiver: boolean;
  statusFlag: number; // 0 = success, 1 = pending, 2 = failed, 3 = deleted
  content: string;
  createdAt: number; // unix timestamp
  receivedAt: number; // unix timestamp
}

/*
  ChatInvitation
  Helps us keep track of chat requests.
  Stored in MMKV under key `chat-invitation-{contactid}`.
*/
export const CHAT_INVITATION_KEY = (contactID: string) => `chat-invitation-${contactID}`;
export interface ChatInvitation {
  requestHash: string;
  invitedID: string;
  createdAt: number;
}

// ----------------- DATABASE FUNCTIONS ------------------ //

export function wipeDatabase() {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}
