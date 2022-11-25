import { MMKV } from 'react-native-mmkv';
import { generateRandomName } from '../utils/RandomName/generateRandomName';

export const storage = new MMKV();

/*
Storage interface {
  `{user}|{messageIndex}`: Message // gets the message for a user at a given index
  `{user}Index`: number // gets the index of the last message for a user
  `allUsers`: string[] // gets all users that you have a conversation with
  `currentUser`: CurrentUser // gets the current user
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
  id: number;
  bridgefyID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
}

export function getOrCreateCurrentUser(bridgefyId: string): CurrentUser {
  const currentUser = storage.getString('currentUser');
  if (currentUser) {
    return JSON.parse(currentUser) as CurrentUser;
  }
  const newCurrentUser: CurrentUser = {
    name: generateRandomName(),
    bridgefyID: bridgefyId,
    dateCreated: new Date().toISOString(),
  };
  storage.set('currentUser', JSON.stringify(newCurrentUser));
  return newCurrentUser;
}

export function setCurrentUser(user: CurrentUser) {
  storage.set('currentUser', JSON.stringify(user));
}

export function addMessageToStorage(
  user: string,
  message: string,
  id: string,
  isReciever: boolean,
) {
  console.log('user', user);
  // const conversation = storage.getString(user);
  const messageIndex: number | undefined = storage.getNumber(`${user}Index`);

  const newMessage: Message = {
    id: 0,
    bridgefyID: id,
    text: message,
    timestamp: Date.now(),
    isReciever: isReciever,
  };

  console.log('message: ', message, 'isReciever: ', isReciever);

  // console.log('conversation', conversation);
  console.log('messageIndex', messageIndex);

  // if (!conversation) {
  if (messageIndex === undefined) {
    // newMessage.id = 0;

    // const newJSON = JSON.stringify({
    //   messages: [newMessage],
    // });

    // storage.set(user, newJSON);
    storage.set(`${user}Index`, 0);
    storage.set(`${user}|0`, JSON.stringify(newMessage));

    // update all convos with new user
    const allUsersString: string | undefined = storage.getString('allUsers');
    const allUsers: string[] = [];
    if (allUsersString !== undefined) {
      allUsers.push(...JSON.parse(allUsersString));
    }
    allUsers.push(user);
    storage.set('allUsers', JSON.stringify(allUsers));
  } else {
    console.log('adding message to existing conversation:', message);
    // const convoJSON = JSON.parse(conversation);

    // const messageHistory = convoJSON.messages;
    // const lastMessage: Message = messageHistory[messageHistory.length - 1];
    // console.log(
    //   'lastMessage ',
    //   lastMessage.bridgefyID,
    //   ' this message ',
    //   id,
    //   ' equal ',
    //   lastMessage.bridgefyID === id,
    // );
    const lastMessageString: string | undefined = storage.getString(
      `${user}|${messageIndex}`,
    );
    if (!lastMessageString) {
      console.log('lastMessageString is undefined');
      return;
    }
    const lastMessage: Message = JSON.parse(lastMessageString);

    if (lastMessage.bridgefyID === id) {
      console.log('duplicate message');
      return;
    }
    newMessage.id = lastMessage.id + 1;

    // convoJSON.messages.push(newMessage);

    // storage.set(user, JSON.stringify(convoJSON));
    storage.set(`${user}Index`, messageIndex + 1);
    storage.set(`${user}|${messageIndex + 1}`, JSON.stringify(newMessage));
  }
}

export function getMessagesFromStorage(user: string) {
  const allMessages: Message[] = [];

  // const conversation = storage.getString(user);
  const messageIndex: number | undefined = storage.getNumber(`${user}Index`);

  console.log(messageIndex);
  // if (!conversation) {
  if (messageIndex === undefined) {
    return allMessages;
  }

  // const convoJSON = JSON.parse(conversation);
  for (let i = 0; i <= messageIndex; i++) {
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

export function getAllConversations() {
  let ret = [];

  const conversations = storage.getAllKeys();
  for (let i = 0; i < conversations.length; i++) {
    const allUserData = storage.getString(conversations[i]);
    if (!allUserData) {
      continue;
    }

    const allUserDataJSON = JSON.parse(allUserData);
    const allMessages = allUserDataJSON.messages;
    ret.push({ id: conversations[i], messages: allMessages });
  }
  return ret;
}

export function getArrayOfConvos(): string[] {
  const allUsersString: string | undefined = storage.getString('allUsers');
  if (allUsersString === undefined) {
    return [];
  }
  const allUsers: string[] = JSON.parse(allUsersString);
  return allUsers;
}

export function wipeDatabase(): void {
  storage.clearAll();
}

export function logDisconnect(userID: string) {
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
