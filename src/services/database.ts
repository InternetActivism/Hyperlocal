import { MMKV } from 'react-native-mmkv';
import { StoredMessageType, TransmissionModeType } from '../utils/globals';
import { fetchConversation } from './message_storage';

// @ts-expect-error
export const storage = new MMKV({ id: 'mmkv.default', fastWrites: false });

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
  isInitialized: boolean;
}

/*
  ContactInfo
  Requires contactID to fetch.
  Stored in MMKV under key `contact-{contactid}`.
*/

export const CONTACT_INFO_KEY = 'all-contact-info-atom';
export interface ContactInfo {
  contactID: string;
  nickname: string;
  contactFlags: number;
  verified: boolean;
  lastSeen: number;
  unreadCount: number;
  firstMsgPointer?: string;
  lastMsgPointer?: string;
  dateCreated: number; // unix timestamp
}

/*
  PublicChatInfo
  Stored in MMKV under key `publicchat`.
*/

export const PUBLIC_CHAT_INFO_KEY = 'public_chat';
export interface PublicChatInfo {
  lastUpdated: number;
  unreadCount: number;
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
  StoredChatMessage Type
*/
export type StoredChatMessage = StoredDirectChatMessage | StoredPublicChatMessage;
export const STORED_CHAT_MESSAGE_KEY = (messageID: string) => `message-${messageID}`;

/*
  StoredChatMessage
  Requires messageID to fetch.
  Stored in MMKV under key `message-{messageid}`.
  Includes nicknames
*/

export interface StoredDirectChatMessage {
  type: StoredMessageType.STORED_DIRECT_MESSAGE;
  messageID: string;
  contactID: string;
  nextMsgPointer?: string;
  prevMsgPointer?: string;
  isReceiver: boolean;
  typeFlag: number; // 0 = normal message, 1 = nickname update
  statusFlag: number; // 0 = received, 1 = sent, 2 = pending, 3 = failed, 4 = deleted
  content: string;
  createdAt: number; // unix timestamp
  receivedAt: number; // unix timestamp
  transmissionMode: TransmissionModeType;
}

/*
  StoredPublicMessage
  Requires messageID to fetch.
  Stored in MMKV under key `publicmessage-{messageid}`.
*/

export interface StoredPublicChatMessage {
  type: StoredMessageType.STORED_PUBLIC_MESSAGE;
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
  transmissionMode: TransmissionModeType;
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

// ----------------- DELIVERED VIA MESH FUNCTIONS ------------------ //

export async function getLast10ReceivedMessageIDs(lastMsgPointer?: string): Promise<string[]> {
  const messages: StoredChatMessage[] = lastMsgPointer ? fetchConversation(lastMsgPointer) : [];
  const receivedMessages = messages.filter((msg) => msg.isReceiver);
  const last10ReceivedMessages = receivedMessages.slice(-10);
  const last6CharsMessageIDs = last10ReceivedMessages.map((msg) => msg.messageID.slice(-6));

  return last6CharsMessageIDs;
}
