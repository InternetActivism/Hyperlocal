// Fetches a conversation from the database via message pointers from newest to oldest.
// Don't make this recursive, recursion is confusing.

import { storage, StoredChatMessage, STORED_CHAT_MESSAGE_KEY } from './database';

// TODO: Add a limit to the number of messages that can be fetched, pagination?
export function fetchConversation(messagePointer: string): StoredChatMessage[] {
  const conversation: StoredChatMessage[] = [];

  let lastMessage = fetchMessage(messagePointer);
  while (lastMessage.prevMsgPointer) {
    conversation.unshift(lastMessage);
    lastMessage = fetchMessage(lastMessage.prevMsgPointer);
  }
  conversation.unshift(lastMessage);

  return conversation;
}

// Fetches a message from the database.
// Intentionally unsafe, throws an error if the message is not found.
export function fetchMessage(messageID: string): StoredChatMessage {
  let messageString: string | undefined = storage.getString(STORED_CHAT_MESSAGE_KEY(messageID));

  if (!messageString) {
    console.log(messageID);
    throw new Error('(fetchMessage) Message not found');
  }

  let messageObj;
  try {
    messageObj = JSON.parse(messageString);
  } catch (e) {
    console.log(messageString);
    throw new Error('(fetchPublicMessage) Not JSON.');
  }

  return messageObj;
}

// Returns true if the message exists in the database.
export function doesMessageExist(messageID: string): boolean {
  return !!storage.getString(STORED_CHAT_MESSAGE_KEY(messageID));
}

// Adds a message to the database.
// Be careful with this function, it's easy to mess up the message pointers and corrupt a whole conversation.
// Don't use this unless you know what you're doing.
export function setMessageWithID(messageID: string, message: StoredChatMessage) {
  storage.set(STORED_CHAT_MESSAGE_KEY(messageID), JSON.stringify(message));
}
