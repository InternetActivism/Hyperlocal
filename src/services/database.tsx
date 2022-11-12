import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export interface Message {
  id: number;
  bridgefyID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
}

export function addMessageToStorage(
  user: string,
  message: string,
  id: string,
  isReciever: boolean,
) {
  console.log('user', user);
  const conversation = storage.getString(user);

  const newMessage: Message = {
    id: Date.now(),
    bridgefyID: id,
    text: message,
    timestamp: Date.now(),
    isReciever: isReciever,
  };

  console.log('conversation', conversation);

  if (!conversation) {
    newMessage.id = 0;

    const newJSON = JSON.stringify({
      messages: [newMessage],
    });

    storage.set(user, newJSON);
  } else {
    console.log('adding message to existing conversation:', message);
    const convoJSON = JSON.parse(conversation);

    const messageHistory = convoJSON.messages;
    const lastMessage: Message = messageHistory[messageHistory.length - 1];
    console.log(
      'lastMessage ',
      lastMessage.bridgefyID,
      ' this message ',
      id,
      ' equal ',
      lastMessage.bridgefyID === id,
    );
    if (lastMessage.bridgefyID === id) {
      console.log('duplicate message');
      return;
    }
    newMessage.id = lastMessage.id + 1;

    convoJSON.messages.push(newMessage);

    // storage.set(user, JSON.stringify({ messages: [newMessage] }));
    storage.set(user, JSON.stringify(convoJSON));
  }
}

export function getMessagesFromStorage(user: string) {
  const conversation = storage.getString(user);

  if (!conversation) {
    return [];
  }

  const convoJSON = JSON.parse(conversation);

  console.log('convoJSON', convoJSON);

  return convoJSON.messages;
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
