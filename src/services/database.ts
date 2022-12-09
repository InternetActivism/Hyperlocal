import { MMKV } from 'react-native-mmkv';
import { generateRandomName } from '../utils/RandomName/generateRandomName';
import { timeSinceTimestamp } from './helpers';

export const storage = new MMKV();

/*

  Rules for storage:
    Timestamps are in milliseconds since epoch. Store as number.

  Storage interface {
    `m-{user}|{index}`: Message // gets the message for a user at a given index
    `user-last-msg-{user}`: number // gets the index of the last message for a user
    `all_users`: string[] // gets all users that you have a conversation with
    `user_info`: UserInfo // gets the current user
    `u-{user}`: ContactInfo // gets the contact info for a user
    `pending-{messageId}`: string // gets the pending message
  }

*/

export interface UserInfo {
  name: string;
  bridgefyID: string;
  dateCreated: string;
}

export interface ContactInfo {
  name: string;
  bridgefyID: string;
  lastSeen: number;
  lastMessageIndex: number;
}

export interface Message {
  index: number;
  messageID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
  flags: number;
}

// this is the format that we stringify and send over bridgefy
// flags is a bitfield, for now only the first bit is used to indicate if the message is a username update
export interface RawMessage {
  text: string;
  flags: number;
}

// an interface for a message that has not been confirmed sent yet
export interface PendingMessage {
  recipient: string;
  messageID: string;
  text: string;
  timestamp: number;
  flags: number;
}

export function getOrCreateUserInfo(userID: string): UserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const UserInfo = storage.getString('user_info');
  if (UserInfo) {
    console.log(
      "(getOrCreateUserInfo) User already exists, returning user's info",
    );
    let userInfo: UserInfo;
    try {
      userInfo = JSON.parse(UserInfo);
    } catch (error) {
      console.log('(getOrCreateUserInfo) Error parsing user info');
      throw error;
    }
    return userInfo;
  }
  const newUserInfo: UserInfo = {
    name: generateRandomName(),
    bridgefyID: userID,
    dateCreated: new Date().toISOString(),
  };
  storage.set('user_info', JSON.stringify(newUserInfo));
  return newUserInfo;
}

export function setUserInfo(userInfo: UserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set('user_info', JSON.stringify(userInfo));
}

export function addMessageToStorage(
  userID: string,
  message_text: string,
  flags: number,
  messageID: string,
  isReciever: boolean,
  timestamp: number,
  messageIndex: number,
): Message | undefined {
  console.log('(addMessageToStorage) Adding message for user:', userID);
  console.log('(addMessageToStorage)', messageID, messageIndex, isReciever);

  // if this is not the first message received from this user
  if (messageIndex !== 0) {
    // check that last message is not corrupted (should never happen, remove once proved)
    const lastMessageString: string | undefined = storage.getString(
      `m-${userID}|${messageIndex - 1}`,
    );
    if (lastMessageString === undefined) {
      console.log('(addMessageToStorage) lastMessageString is undefined');
      return;
    }

    // check that last message is not a duplicate
    let lastMessage: Message;
    try {
      lastMessage = JSON.parse(lastMessageString);
    } catch (error) {
      console.log('(addMessageToStorage) Error parsing last message');
      throw error;
    }
    if (lastMessage.messageID === messageID) {
      console.log('(addMessageToStorage) Duplicate message.');
      return;
    }
  }

  const message: Message = {
    index: messageIndex,
    messageID, // comes from bridgefy
    text: message_text,
    timestamp,
    isReciever,
    flags,
  };

  storage.set(`m-${userID}|${messageIndex}`, JSON.stringify(message));

  return message;
}

export function getMessagesFromStorage(userID: string, messageIndex: number) {
  if (messageIndex === -1) {
    return [];
  }

  const allMessages: Message[] = [];

  for (let i = 0; i <= messageIndex; i++) {
    const messageString: string | undefined = storage.getString(
      `${userID}|${i}`,
    );
    if (!messageString) {
      console.log(
        '(getMessagesFromStorage) MessageString is undefined for index',
        i,
      );
      continue;
    }
    const message: Message = JSON.parse(messageString);
    allMessages.push(message);
  }

  return allMessages;
}

export function getArrayOfConvos(): string[] {
  const allUsersString: string | undefined = storage.getString('all_users');
  return allUsersString ? JSON.parse(allUsersString) : [];
}

export function wipeDatabase() {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

export function logDisconnect(contactID: string) {
  console.log('(logDisconnect) Logging disconnect for contact:', contactID);
  updateLastSeen(contactID);
}

export function updateLastSeen(contactID: string) {
  console.log('(updateLastSeen) Updating last seen for contact:', contactID);
  const contactString: string | undefined = storage.getString(`u-${contactID}`);
  if (contactString === undefined) {
  } else {
    const contact: ContactInfo = JSON.parse(contactString);
    contact.lastSeen = Date.now();
    storage.set(`u-${contactID}`, JSON.stringify(contact));
  }
}

export function getLastSeenTime(contactID: string): string {
  const contactString: string | undefined = storage.getString(`u-${contactID}`);
  if (contactString === undefined) {
    console.log('(getLastSeenTime) Contact not found');
    throw new Error('Contact not found');
  }
  const contact: ContactInfo = JSON.parse(contactString);
  return timeSinceTimestamp(contact.lastSeen);
}

export function getOrCreateContactInfo(contactID: string): ContactInfo {
  console.log(
    '(getOrCreateContactInfo) Getting contact info for contact:',
    contactID,
  );
  const contactString = storage.getString(`u-${contactID}`);

  // return existing contact info
  if (contactString) {
    let contactInfo: ContactInfo;
    try {
      contactInfo = JSON.parse(contactString);
    } catch (error) {
      console.log('(getOrCreateContactInfo) Error parsing contact info');
      throw error;
    }
    return contactInfo;
  }

  // create new contact info
  const contactInfo: ContactInfo = {
    bridgefyID: contactID,
    name: contactID,
    lastSeen: Date.now(),
    lastMessageIndex: -1, // new contact, no messages.
  };
  storage.set(`u-${contactID}`, JSON.stringify(contactInfo));

  // add new user to index of all users
  const allUsersString = storage.getString('all_users');
  const allUsers: string[] = allUsersString
    ? [...JSON.parse(allUsersString)]
    : [];
  storage.set('all_users', JSON.stringify(allUsers.concat(contactID)));

  return contactInfo;
}

export function updateContactInfo(contactInfo: ContactInfo) {
  const contactString = storage.getString(`u-${contactInfo.bridgefyID}`);

  // don't update if we don't have a record of this user
  if (contactString === undefined) {
    console.log(
      "(updateContactInfo) Fatal, couldn't find contact:",
      contactInfo.bridgefyID,
    );
    throw new Error('Fatal, could not find contact');
  }

  storage.set(`u-${contactInfo.bridgefyID}`, JSON.stringify(contactInfo));
}

export function getPendingMessage(messageID: string): PendingMessage {
  console.log('(getPendingMessage) Getting pending message:', messageID);
  const messageString = storage.getString(`pending-${messageID}`);
  if (messageString === undefined) {
    console.log(
      '(getPendingMessage) Fatal, could not find user:',
      messageString,
    );
    throw new Error('Fatal, could not find user');
  }
  return JSON.parse(messageString);
}

export function addPendingMessage(message: PendingMessage) {
  storage.set(`pending-${message.messageID}`, JSON.stringify(message));
}

export function removePendingMessage(messageID: string) {
  storage.delete(`pending-${messageID}`);
}
