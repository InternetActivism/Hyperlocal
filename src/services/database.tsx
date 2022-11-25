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
  lastSeen: string; //'August 19, 1975 23:15:30
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
