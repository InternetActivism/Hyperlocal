import { MMKV } from 'react-native-mmkv';
import { sendMessage } from '../bridgefy-link';
import { addPendingMessage } from './messages';

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
  friend: boolean;
  lastSeen: number;
  firstMsgPointer: string;
  lastMsgPointer: string;
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
  contactID: string;
  nextMsgPointer: string;
  prevMsgPointer: string;
  isReceiver: boolean;
  typeFlag: number; // 0 = normal message, 1 = username update
  statusFlag: number; // 0 = sent, 1 = failed, 2 = pending, 3 = deleted
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
  text: string;
  flags: number;
  createdAt: number; // unix timestamp
}

/* 

  Misc functions

*/

export function getArrayOfConvos(): string[] {
  const allUsersString: string | undefined = storage.getString('all_users');
  return allUsersString ? JSON.parse(allUsersString) : [];
}

export function wipeDatabase() {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

export async function sendMessageWrapper(
  messageText: string,
  flags: number,
  contactId: string
): Promise<string> {
  const messageObj: RawMessage = {
    text: messageText,
    flags: flags,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObj);
  const messageID = await sendMessage(messageRaw, contactId);
  addPendingMessage({
    messageID,
    text: messageObj.text,
    timestamp: messageObj.createdAt,
    recipient: contactId,
    flags: messageObj.flags,
  });
  return messageID;
}
