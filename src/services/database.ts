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
}

export interface Message {
  index: number;
  messageID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
}

// an interface for a message that has not been confirmed sent yet
export interface PendingMessage {
  messageID: string;
  text: string;
  recipient: string;
  timestamp: number;
}

export function getOrCreateUserInfo(bridgefyID: string): UserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const UserInfo = storage.getString('user_info');
  if (UserInfo) {
    console.log(
      "(getOrCreateUserInfo) User already exists, returning user's info",
    );
    return JSON.parse(UserInfo) as UserInfo;
  }
  const newUserInfo: UserInfo = {
    name: generateRandomName(),
    bridgefyID: bridgefyID,
    dateCreated: new Date().toISOString(),
  };
  storage.set('user_info', JSON.stringify(newUserInfo));
  return newUserInfo;
}

export function setUserInfo(user: UserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set('user_info', JSON.stringify(user));
}

export function addMessageToStorage(
  userID: string,
  message_text: string,
  messageID: string,
  isReciever: boolean,
  timestamp: number,
) {
  console.log(
    '(addMessageToStorage) Adding message for user:',
    userID,
    'messageID: ',
    messageID,
    'isReciever: ',
    isReciever,
  );

  const lastMessageIndex: number | undefined = storage.getNumber(
    `${userID}-last_message_index`,
  );
  let messageIndex;

  console.log('(addMessageToStorage) lastMessageIndex', lastMessageIndex);

  // check if this is the first message received from this user
  if (lastMessageIndex === undefined) {
    // first message for this user
    messageIndex = 0;

    // add new user to index of all users
    const allUsersString: string | undefined = storage.getString('all_users');
    const allUsers: string[] = allUsersString
      ? [...JSON.parse(allUsersString)]
      : [];
    storage.set('all_users', JSON.stringify(allUsers.concat(userID)));
  } else {
    messageIndex = lastMessageIndex + 1;

    // check that last message is not corrupted (should never happen, remove once proved)
    const lastMessageString: string | undefined = storage.getString(
      `${userID}|${lastMessageIndex}`,
    );
    if (lastMessageString === undefined) {
      console.log('(addMessageToStorage) lastMessageString is undefined');
      return;
    }

    // check that last message is not a duplicate
    const lastMessage: Message = JSON.parse(lastMessageString);
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
  };

  storage.set(`${userID}-last_message_index`, messageIndex);
  storage.set(`${userID}|${messageIndex}`, JSON.stringify(message));
}

export function getMessagesFromStorage(userID: string) {
  const allMessages: Message[] = [];

  // const conversation = storage.getString(user);
  const lastMessageIndex: number | undefined = storage.getNumber(
    `${userID}-last_message_index`,
  );

  console.log(lastMessageIndex);
  // if (!conversation) {
  if (lastMessageIndex === undefined) {
    return allMessages;
  }

  // const convoJSON = JSON.parse(conversation);
  for (let i = 0; i <= lastMessageIndex; i++) {
    const messageString: string | undefined = storage.getString(
      `${userID}|${i}`,
    );
    if (!messageString) {
      console.log('messageString is undefined for index', i);
      continue;
    }
    const message: Message = JSON.parse(messageString);
    allMessages.push(message);
  }

  // console.log('convoJSON', convoJSON);
  // console.log('allMessages', allMessages);

  return allMessages;
}

export function getArrayOfConvos(): string[] {
  const allUsersString: string | undefined = storage.getString('all_users');
  return allUsersString ? JSON.parse(allUsersString) : [];
}

export function wipeDatabase(): void {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

export function logDisconnect(userID: string) {
  console.log('(logDisconnect) Logging disconnect for contact:', userID);
  updateLastSeen(userID);
}

export function updateLastSeen(userID: string) {
  console.log('(updateLastSeen) Updating last seen for contact:', userID);
  const userString: string | undefined = storage.getString(userID);
  if (userString === undefined) {
    const user: ContactInfo = {
      name: userID,
      bridgefyID: userID,
      lastSeen: Date.now(),
    };
    storage.set(userID, JSON.stringify(user));
  } else {
    const user: ContactInfo = JSON.parse(userString);
    user.lastSeen = Date.now();
    storage.set(userID, JSON.stringify(user));
  }
}

export function getLastSeenTime(userID: string): string {
  const userString: string | undefined = storage.getString(userID);
  if (userString === undefined) {
    return "You haven't talked to this user yet";
  }
  const user: ContactInfo = JSON.parse(userString);
  return timeSinceTimestamp(user.lastSeen);
}

export function getContactInfo(userId: string): ContactInfo {
  const userString: string | undefined = storage.getString(userId);
  if (userString === undefined) {
    throw new Error('User not found');
  }
  return JSON.parse(userString);
}

export function getPendingMessage(messageID: string): PendingMessage {
  const messageString: string | undefined = storage.getString(
    `pending-${messageID}`,
  );
  if (messageString === undefined) {
    throw new Error('Message not found');
  }
  return JSON.parse(messageString);
}

export function addPendingMessage(message: PendingMessage) {
  storage.set(`pending-${message.messageID}`, JSON.stringify(message));
}

export function removePendingMessage(messageID: string) {
  storage.delete(`pending-${messageID}`);
}
