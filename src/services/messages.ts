import { Message, PendingMessage, storage } from './database';

export function getPendingMessage(messageID: string): PendingMessage | null {
  console.log('(getPendingMessage) Getting pending message:', messageID);
  const messageString = storage.getString(`pending-${messageID}`);
  if (messageString === undefined) {
    console.log(
      '(getPendingMessage) Fatal, could not find pending message:',
      messageString,
    );
    return null; // this sometiemes happens, not sure why on launch
  }
  return JSON.parse(messageString);
}

export function addPendingMessage(message: PendingMessage) {
  console.log(
    '(addPendingMessage) Adding pending message:',
    `pending-${message.messageID}`,
    message,
  );
  storage.set(`pending-${message.messageID}`, JSON.stringify(message));
}

export function removePendingMessage(messageID: string) {
  storage.delete(`pending-${messageID}`);
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
  console.log('(addMessageToStorage)', message_text, flags, timestamp);

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
      `m-${userID}|${i}`,
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
