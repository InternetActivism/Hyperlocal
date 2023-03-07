import {
  PublicChatInfo,
  PUBLIC_CHAT_INFO_KEY,
  storage,
  StoredPublicChatMessage,
  STORED_PUBLIC_MESSAGE_KEY,
} from './database';

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

// Fetches a conversation from the database via message pointers from newest to oldest.
// Don't make this recursive, recursion is confusing.
// TODO: Add a limit to the number of messages that can be fetched, pagination?
export function fetchPublicConversation(messagePointer: string): StoredPublicChatMessage[] {
  const conversation: StoredPublicChatMessage[] = [];

  let lastMessage = fetchPublicMessage(messagePointer);
  while (lastMessage.prevMsgPointer) {
    conversation.unshift(lastMessage);
    lastMessage = fetchPublicMessage(lastMessage.prevMsgPointer);
  }
  conversation.unshift(lastMessage);

  return conversation;
}

// Returns the conversation history for the public chat.
// Uses the lastMsgPointer and firstMsgPointer to fetch all messages in the conversation.
export function getPublicChatConversation(): StoredPublicChatMessage[] {
  const chatInfo = getPublicChatInfo();

  if (!chatInfo) {
    console.log(chatInfo);
    throw new Error('Public chat not found');
  }

  if (!chatInfo.lastMsgPointer || !chatInfo.firstMsgPointer) {
    console.log('(getConversationHistory) No messages in conversation.');
    return [];
  }

  return fetchPublicConversation(chatInfo.lastMsgPointer);
}

// Returns true if the message exists in the database.
export function doesPublicMessageExist(messageID: string): boolean {
  return !!storage.getString(STORED_PUBLIC_MESSAGE_KEY(messageID));
}

// Fetches a message from the database.
// Intentionally unsafe, throws an error if the message is not found.
export function fetchPublicMessage(messageID: string): StoredPublicChatMessage {
  let messageString: string | undefined = storage.getString(STORED_PUBLIC_MESSAGE_KEY(messageID));

  if (!messageString) {
    console.log(messageID);
    throw new Error('(fetchPublicMessage) Message not found');
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

// Adds a pulic message to the database.
// Be careful with this function, it's easy to mess up the message pointers and corrupt a whole conversation.
// Don't use this unless you know what you're doing.
export function setPublicMessageWithID(messageID: string, message: StoredPublicChatMessage) {
  storage.set(STORED_PUBLIC_MESSAGE_KEY(messageID), JSON.stringify(message));
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

  console.log(!!publicChatInfo?.lastMsgPointer);

  // set publicChatInfo pointers
  if (publicChatInfo?.lastMsgPointer) {
    const lastMessage = fetchPublicMessage(publicChatInfo.lastMsgPointer);
    lastMessage.nextMsgPointer = messageID;
    setPublicMessageWithID(lastMessage.messageID, lastMessage);

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
  setPublicMessageWithID(messageID, message);
}
