import { MESSAGE_PENDING_EXPIRATION_TIME, MessageStatus } from '../../utils/globals';
import { getContactInfo, updateContactInfo } from './contacts';
import { storage, StoredChatMessage, STORED_DIRECT_MESSAGE_KEY } from './database';

/*
  Message
  Type of all messages sent over the mesh network.
*/
export type Message =
  | TextMessagePacket
  | NicknameUpdatePacket
  | ChatInvitationPacket
  | ConnectionInfoPacket;

/*
  RawMessage 
  Interface of all packets sent over the mesh network.
*/
export interface RawMessage {
  flags: number;
  createdAt: number; // unix timestamp
}

/*
  TextMessagePacket 
  Format that we stringify and send over mesh network
*/
export interface TextMessagePacket extends RawMessage {
  message: string;
}

/*
  NicknameUpdatePacket 
  Format that we stringify and send over mesh network
*/
export interface NicknameUpdatePacket extends RawMessage {
  nickname: string;
}

/*
  ConnectionInfoPacket 
  Format that we stringify and send over mesh network
*/
export interface ConnectionInfoPacket extends RawMessage {
  publicName: string;
}

/*
  ChatInvitationPacket 
  Format that we stringify and send over mesh network.
*/
export interface ChatInvitationPacket extends RawMessage {
  requestHash: string;
  accepted?: boolean; // only used if the user is the receiver
  // nickname: string;
  // insert personal information that's private here in the future
}

// ------------------ Message Functions ------------------

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

// TODO: Limit this to 100 messages and integrate pagination/scrolling into chat page.
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

export function doesMessageExist(messageID: string): boolean {
  return !!storage.getString(STORED_DIRECT_MESSAGE_KEY(messageID));
}

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

export function setMessageWithID(messageID: string, message: StoredChatMessage) {
  // careful, this might cause message history corruption if you don't know what you're doing
  // don't use this unless you know what you're doing
  storage.set(STORED_DIRECT_MESSAGE_KEY(messageID), JSON.stringify(message));
}

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

// Assumes contact exists.
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
    console.log("contact doesn't have a last message pointer");
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

// TODO: this feels inefficient since it iterates through the entire conversation history, but it's probably fine for now
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
