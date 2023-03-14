import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { PublicChatInfo, PUBLIC_CHAT_INFO_KEY, storage, StoredPublicChatMessage } from './database';
import { fetchConversation, fetchMessage, setMessageWithID } from './message_storage';

// ------------------ Public Chat Core Functions ------------------ //

// Gets the current user info from the database or creates a new one if it doesn't exist.
export function getOrCreatePublicChatDatabase(): PublicChatInfo {
  console.log('(getOrCreatePublicChatDatabase) Create/get public chat info.');
  const infoString = storage.getString(PUBLIC_CHAT_INFO_KEY());
  if (infoString) {
    console.log('(getOrCreatePublicChatDatabase) Public chat info already exists, returning.');
    let infoObj: PublicChatInfo;
    try {
      infoObj = JSON.parse(infoString);
    } catch (error) {
      console.log(infoString);
      throw error;
    }
    return infoObj;
  }

  const newPublicInfo: PublicChatInfo = {
    lastUpdated: Date.now(),
  };
  console.log('(getOrCreatePublicChatDatabase) Setting public chat info', newPublicInfo);
  storage.set(PUBLIC_CHAT_INFO_KEY(), JSON.stringify(newPublicInfo));
  return newPublicInfo;
}

// Updates the public chat info.
// Intentionally unsafe, throws an error if the info is not found.
// Use this instead of setPublicChatInfo if you know the contact already exists.
export function updatePublicChatInfo(publicChatInfo: PublicChatInfo) {
  const infoString = storage.getString(PUBLIC_CHAT_INFO_KEY());
  if (!infoString) {
    console.log(publicChatInfo);
    throw new Error('Fatal, could not find info.');
  }
  storage.set(PUBLIC_CHAT_INFO_KEY(), JSON.stringify(publicChatInfo));
}

// Sets the contact info for a given contact.
export function setPublicChatInfo(publicChatInfo: PublicChatInfo) {
  console.log('(setPublicChatInfo) Setting contact info for public chat');
  storage.set(PUBLIC_CHAT_INFO_KEY(), JSON.stringify(publicChatInfo));
  return publicChatInfo;
}

// Gets the chat info for the public chat.
// Intentionally unsafe, throws an error if the contact is not found.
export function getPublicChatInfo(): PublicChatInfo {
  console.log('(getPublicChatInfo) Getting public chat');
  const chatInfoString = storage.getString(PUBLIC_CHAT_INFO_KEY());
  if (!chatInfoString) {
    console.log('(getPublicChatInfo) Public chat info not found');
    throw new Error('Public chat info not found');
  }
  try {
    return JSON.parse(chatInfoString);
  } catch (error) {
    console.log('(getPublicChatInfo) Error parsing chat info');
    throw error;
  }
}

// ------------------ Public Chat Message Functions ------------------ //

// Returns the conversation history for the public chat.
// Uses the lastMsgPointer and firstMsgPointer to fetch all messages in the conversation.
export function getPublicChatConversation(): StoredPublicChatMessage[] {
  const chatInfo = getPublicChatInfo();

  if (!chatInfo) {
    console.log(chatInfo);
    throw new Error('Public chat not found');
  }

  if (!chatInfo.lastMsgPointer || !chatInfo.firstMsgPointer) {
    console.log('(getPublicChatConversation) No messages in conversation.');
    return [];
  }

  return fetchConversation(chatInfo.lastMsgPointer) as StoredPublicChatMessage[];
}

// Saves a message to the database.
export function savePublicChatMessageToStorage(
  messageID: string,
  message: StoredPublicChatMessage
) {
  console.log('(savePublicChatMessageToStorage) Saving message to database.', message);
  const publicChatInfo = getPublicChatInfo();

  // set message pointers
  message.prevMsgPointer = publicChatInfo?.lastMsgPointer;
  message.nextMsgPointer = undefined;

  // set publicChatInfo pointers
  if (publicChatInfo?.lastMsgPointer) {
    const lastMessage = fetchMessage(publicChatInfo.lastMsgPointer);
    lastMessage.nextMsgPointer = messageID;
    setMessageWithID(lastMessage.messageID, lastMessage);

    updatePublicChatInfo({
      ...publicChatInfo,
      lastMsgPointer: messageID,
    });
  } else {
    console.log(
      "(savePublicChatMessageToStorage) First message: publicChatInfo doesn't have a last message pointer."
    );
    if (publicChatInfo?.firstMsgPointer) {
      throw new Error('firstMsgPointer is defined but lastMsgPointer is not');
    }
    updatePublicChatInfo({
      ...publicChatInfo,
      lastMsgPointer: messageID,
      firstMsgPointer: messageID,
    });
  }

  // save message
  setMessageWithID(messageID, message);
}

// Iterates through the conversation history and removes all pending messages that are older than MESSAGE_PENDING_EXPIRATION_TIME.
// TODO: This is inefficient since it iterates through the entire conversation history, but it's probably fine for now. We can optimize later.
export function expirePublicPendingMessages(): boolean {
  console.log('(expirePublicPendingMessages) Expiring pending messages for contact');
  const conversation = getPublicChatConversation();
  const now = Date.now();
  let didUpdate = false;

  conversation.forEach((message) => {
    if (
      !message.isReceiver &&
      message.statusFlag === MessageStatus.PENDING &&
      now - message.createdAt > MESSAGE_PENDING_EXPIRATION_TIME
    ) {
      didUpdate = true;
      message.statusFlag = MessageStatus.FAILED;
      setMessageWithID(message.messageID, message);
    }
  });

  return didUpdate;
}
