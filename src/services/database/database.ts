import { MMKV } from 'react-native-mmkv';
import { MessageStatus, MessageType } from '../../utils/globals';
import { CachedConversation } from '../atoms';
import { sendMessage } from '../bridgefy-link';
import {
  saveChatMessageToStorage,
  getConversationHistory,
  ChatInvitationPacket,
  ConnectionInfoPacket,
  TextMessagePacket,
  NicknameUpdatePacket,
} from './messages';

export const storage = new MMKV();

/*
  CurrentUserInfo 
  Stored in MMKV under key `current_user_info`
*/

export const CURRENT_USER_INFO_KEY = () => 'current_user_info';
export interface CurrentUserInfo {
  userID: string;
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
  ChatInvitation
  Helps us keep track of chat requests.
*/
export const CHAT_INVITATION_KEY = (contactID: string) => `chat-invitation-${contactID}`;
export interface ChatInvitation {
  requestHash: string;
  invitedID: string;
  createdAt: number;
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

export function verifyChatInvitation(contactID: string, requestHash: string): boolean {
  const invitation = storage.getString(CHAT_INVITATION_KEY(contactID));
  if (invitation) {
    const invitationObject = JSON.parse(invitation) as ChatInvitation;
    if (invitationObject.requestHash === requestHash) {
      return true;
    }
  }
  return false;
}

export async function sendChatInvitationWrapper(contactID: string): Promise<string> {
  // in the future we'll pass along sensitive user info with the invitation that we can't share publicly to random connections
  const messageObject: ChatInvitationPacket = {
    requestHash: Math.random().toString(36).substring(7),
    flags: MessageType.CHAT_INVITATION,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  // save the invitation to storage
  const invitation: ChatInvitation = {
    requestHash: messageObject.requestHash,
    invitedID: contactID,
    createdAt: Date.now(),
  };
  storage.set(CHAT_INVITATION_KEY(contactID), JSON.stringify(invitation));

  return messageID;
}

export async function sendChatInvitationResponseWrapper(
  contactID: string,
  requestHash: string,
  accepted: boolean
): Promise<string> {
  const messageObject: ChatInvitationPacket = {
    requestHash: requestHash,
    accepted: accepted,
    flags: MessageType.CHAT_INVITATION_RESPONSE,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

export async function sendConnectionInfoWrapper(
  contactID: string,
  publicName: string
): Promise<string> {
  const messageObject: ConnectionInfoPacket = {
    publicName: publicName,
    flags: MessageType.PUBLIC_INFO,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

// Assumes that the contact exists.
export async function sendChatMessageWrapper(
  contactID: string,
  message_text: string
): Promise<string> {
  const messageObject: TextMessagePacket = {
    message: message_text,
    flags: MessageType.TEXT,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  console.log('(sendMessageWrapper) Creating new message');
  saveChatMessageToStorage(contactID, messageID, {
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: MessageType.TEXT,
    statusFlag: MessageStatus.PENDING,
    content: message_text,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}

// Assumes that the contact exists.
export async function sendNicknameUpdateWrapper(
  contactID: string,
  nickname: string
): Promise<string> {
  const messageObject: NicknameUpdatePacket = {
    nickname: nickname,
    flags: MessageType.NICKNAME_UPDATE,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  console.log('(sendMessageWrapper) Creating new message');
  saveChatMessageToStorage(contactID, messageID, {
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: MessageType.NICKNAME_UPDATE,
    statusFlag: MessageStatus.PENDING,
    content: nickname,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}

// Updates the conversation cache with a new message history for a given contact.
// TODO: Make this more efficient by not wiping the entire cache.
export function updateConversationCacheDeprecated(
  contactID: string,
  history: StoredChatMessage[],
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
