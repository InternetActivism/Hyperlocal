import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from 'utils/globals';
import { getContactInfo, updateContactInfo } from './contacts';
import { storage, StoredChatMessage, STORED_DIRECT_MESSAGE_KEY } from './database';

// ------------------ Message Functions ------------------ //

// Returns the conversation history for a given contact.
// You can't fetch a conversation without the contact information which stores the message pointers.
// Uses the lastMsgPointer and firstMsgPointer to fetch all messages in the conversation.
export function getConversationHistory(contactID: string): StoredChatMessage[] {
  const contact = getContactInfo(contactID);

  if (!contact) {
    console.log(contactID);
    throw new Error('Contact not found');
  }

  if (!contact.lastMsgPointer || !contact.firstMsgPointer) {
    console.log('(getConversationHistory) No messages in conversation.');
    return [];
  }

  return fetchConversation(contact.lastMsgPointer);
}

// Fetches a conversation from the database via message pointers from newest to oldest.
// Don't make this recursive, recursion is confusing.
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

// Returns true if the message exists in the database.
export function doesMessageExist(messageID: string): boolean {
  return !!storage.getString(STORED_DIRECT_MESSAGE_KEY(messageID));
}

// Fetches a message from the database.
// Intentionally unsafe, throws an error if the message is not found.
export function fetchMessage(messageID: string): StoredChatMessage {
  let messageString: string | undefined = storage.getString(STORED_DIRECT_MESSAGE_KEY(messageID));

  if (!messageString) {
    console.log(messageID);
    throw new Error('Message not found');
  }

  let messageObj;
  try {
    messageObj = JSON.parse(messageString);
  } catch (e) {
    console.log(messageString);
    throw new Error('(onMessageReceived) Not JSON.');
  }

  return messageObj;
}

// Adds a message to the database.
// Be careful with this function, it's easy to mess up the message pointers and corrupt a whole conversation.
// Don't use this unless you know what you're doing.
export function setMessageWithID(messageID: string, message: StoredChatMessage) {
  storage.set(STORED_DIRECT_MESSAGE_KEY(messageID), JSON.stringify(message));
}

// Completely deletes a message from the database.
// Try to not use this function if instead you can mark messages as deleted instead.
export function deleteMessageWithID(messageID: string) {
  const message = fetchMessage(messageID);
  const contact = getContactInfo(message.contactID);

  const lastBool = contact?.lastMsgPointer === messageID;
  const firstBool = contact?.firstMsgPointer === messageID;

  // this is the only message in the conversation
  if (lastBool && firstBool) {
    updateContactInfo(message.contactID, {
      ...contact,
      lastMsgPointer: undefined,
      firstMsgPointer: undefined,
    });
  } else if (firstBool) {
    if (!message.prevMsgPointer) {
      throw new Error('Message.prevMsgPointer is undefined');
    }
    const prevMessage = fetchMessage(message.prevMsgPointer);
    if (
      message.prevMsgPointer !== prevMessage.messageID ||
      prevMessage.nextMsgPointer !== messageID
    ) {
      throw new Error('Message pointers are not consistent');
    }
    prevMessage.nextMsgPointer = undefined;
    setMessageWithID(prevMessage.messageID, prevMessage);

    updateContactInfo(message.contactID, {
      ...contact,
      firstMsgPointer: prevMessage.messageID,
    });
  } else if (lastBool) {
    if (!message.nextMsgPointer) {
      throw new Error('Message.nextMsgPointer is undefined');
    }
    const nextMessage = fetchMessage(message.nextMsgPointer);
    if (
      message.nextMsgPointer !== nextMessage.messageID ||
      nextMessage.prevMsgPointer !== messageID
    ) {
      throw new Error('Message pointers are not consistent');
    }
    nextMessage.prevMsgPointer = undefined;
    setMessageWithID(nextMessage.messageID, nextMessage);

    updateContactInfo(message.contactID, {
      ...contact,
      lastMsgPointer: nextMessage.messageID,
    });
  } else {
    if (!message.nextMsgPointer || !message.prevMsgPointer) {
      throw new Error('Message.nextMsgPointer or Message.prevMsgPointer is undefined');
    }
    const nextMessage = fetchMessage(message.nextMsgPointer);
    const prevMessage = fetchMessage(message.prevMsgPointer);
    if (
      message.nextMsgPointer !== nextMessage.messageID ||
      nextMessage.prevMsgPointer !== messageID ||
      message.prevMsgPointer !== prevMessage.messageID ||
      prevMessage.nextMsgPointer !== messageID
    ) {
      throw new Error('Message pointers are not consistent');
    }
    nextMessage.prevMsgPointer = prevMessage.messageID;
    prevMessage.nextMsgPointer = nextMessage.messageID;
    setMessageWithID(nextMessage.messageID, nextMessage);
    setMessageWithID(prevMessage.messageID, prevMessage);
  }

  // delete message from storage
  storage.delete(STORED_DIRECT_MESSAGE_KEY(messageID));
}

// Saves a message to the database.
export function saveChatMessageToStorage(
  contactID: string,
  messageID: string,
  message: StoredChatMessage
) {
  console.log('(saveChatMessageToStorage) Saving message to database.', message);
  const contact = getContactInfo(contactID);

  // set message pointers
  message.prevMsgPointer = contact?.lastMsgPointer;
  message.nextMsgPointer = undefined;

  console.log(!!contact?.lastMsgPointer);

  // set contact pointers
  if (contact?.lastMsgPointer) {
    const lastMessage = fetchMessage(contact.lastMsgPointer);
    lastMessage.nextMsgPointer = messageID;
    setMessageWithID(lastMessage.messageID, lastMessage);

    updateContactInfo(contactID, {
      ...contact,
      lastMsgPointer: messageID,
    });
  } else {
    console.log(
      "(saveChatMessageToStorage) First message: contact doesn't have a last message pointer."
    );
    if (contact?.firstMsgPointer) {
      throw new Error('Contact.firstMsgPointer is defined but Contact.lastMsgPointer is not');
    }
    updateContactInfo(contactID, {
      ...contact,
      lastMsgPointer: messageID,
      firstMsgPointer: messageID,
    });
  }

  // save message
  setMessageWithID(messageID, message);
}

// Iterates through the conversation history and removes all pending messages that are older than MESSAGE_PENDING_EXPIRATION_TIME.
// TODO: This is inefficient since it iterates through the entire conversation history, but it's probably fine for now. We can optimize later.
export function expirePendingMessages(contactID: string): boolean {
  console.log('(expirePendingMessages) Expiring pending messages for contact', contactID);
  const conversation = getConversationHistory(contactID);
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
