import { MMKV } from 'react-native-mmkv';
import { generateRandomName } from '../utils/RandomName/generateRandomName';

export const storage = new MMKV();

/*
Storage interface {
  `{user}|{index}`: Message // gets the message for a user at a given index
  `{user}-last_message_index`: number // gets the index of the last message for a user
  `all_users`: string[] // gets all users that you have a conversation with
  `current_user`: CurrentUser // gets the current user
}
*/

export interface CurrentUser {
  name: string;
  bridgefyID: string;
  dateCreated: string;
}

export interface ConnectedUser {
  name: string;
  bridgefyID: string;
  lastSeen: string; // ISO string
}

export interface Message {
  index: number;
  messageID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
}

export function getOrCreateCurrentUser(bridgefyID: string): CurrentUser {
  console.log('(getOrCreateCurrentUser) Creating new user');
  const currentUser = storage.getString('current_user');
  if (currentUser) {
    console.log(
      "(getOrCreateCurrentUser) User already exists, returning user's info",
    );
    return JSON.parse(currentUser) as CurrentUser;
  }
  const newCurrentUser: CurrentUser = {
    name: generateRandomName(),
    bridgefyID: bridgefyID,
    dateCreated: new Date().toISOString(),
  };
  storage.set('current_user', JSON.stringify(newCurrentUser));
  return newCurrentUser;
}

export function setCurrentUser(user: CurrentUser) {
  console.log('(setCurrentUser) Setting current user');
  storage.set('current_user', JSON.stringify(user));
}

export function addMessageToStorage(
  user: string,
  message_text: string,
  messageID: string,
  isReciever: boolean,
  timestamp: number,
) {
  console.log(
    '(addMessageToStorage) Adding message for user:',
    user,
    'messageID: ',
    messageID,
    'isReciever: ',
    isReciever,
  );

  const lastMessageIndex: number | undefined = storage.getNumber(
    `${user}-last_message_index`,
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
    storage.set('all_users', JSON.stringify(allUsers.concat(user)));
  } else {
    messageIndex = lastMessageIndex + 1;

    // check that last message is not corrupted (should never happen, remove once proved)
    const lastMessageString: string | undefined = storage.getString(
      `${user}|${lastMessageIndex}`,
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

  storage.set(`${user}-last_message_index`, messageIndex);
  storage.set(`${user}|${messageIndex}`, JSON.stringify(message));
}

export function getMessagesFromStorage(user: string) {
  const allMessages: Message[] = [];

  // const conversation = storage.getString(user);
  const lastMessageIndex: number | undefined = storage.getNumber(
    `${user}-last_message_index`,
  );

  console.log(lastMessageIndex);
  // if (!conversation) {
  if (lastMessageIndex === undefined) {
    return allMessages;
  }

  // const convoJSON = JSON.parse(conversation);
  for (let i = 0; i <= lastMessageIndex; i++) {
    const messageString: string | undefined = storage.getString(`${user}|${i}`);
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
  if (allUsersString === undefined) {
    return [];
  }
  const allUsers: string[] = JSON.parse(allUsersString);
  return allUsers;
}

export function wipeDatabase(): void {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

export function logDisconnect(userID: string) {
  console.log('(logDisconnect) Logging disconnect for user:', userID);
  const userString: string | undefined = storage.getString(userID);
  const dateNow: Date = new Date();
  const dateString: string = dateNow.toISOString();

  if (userString === undefined) {
    const user: ConnectedUser = {
      name: userID,
      bridgefyID: userID,
      lastSeen: dateString,
    };
    storage.set(userID, JSON.stringify(user));
    return;
  }
  const user: ConnectedUser = JSON.parse(userString);
  user.lastSeen = dateString;
  storage.set(userID, JSON.stringify(user));
}

export function getLastSeenTime(user: string): string {
  const userString: string | undefined = storage.getString(user);
  if (userString === undefined) {
    return "You haven't talked to this user yet";
  }
  const userJSON = JSON.parse(userString);
  const lastSeen: Date = new Date(userJSON.lastSeen);
  return timeSince(lastSeen);
}

function timeSince(date: Date) {
  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
}
