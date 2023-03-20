import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { ContactInfo, StoredDirectChatMessage } from './database';
import { fetchConversation, fetchMessage, setMessageWithID } from './message_storage';

// ------------------ Message Functions ------------------ //

// Saves a message to the database.
export function saveChatMessageToStorage(
  contactInfo: ContactInfo,
  messageID: string,
  message: StoredDirectChatMessage
) {
  console.log('(saveChatMessageToStorage) Saving message to database.', message);

  // set message pointers
  message.prevMsgPointer = contactInfo.lastMsgPointer;
  message.nextMsgPointer = undefined;

  // set contact pointers
  if (contactInfo.lastMsgPointer) {
    const lastMessage = fetchMessage(contactInfo.lastMsgPointer);
    lastMessage.nextMsgPointer = messageID;
    setMessageWithID(lastMessage.messageID, lastMessage);
  } else {
    console.log(
      "(saveChatMessageToStorage) First message: contact doesn't have a last message pointer."
    );
    if (contactInfo.firstMsgPointer) {
      throw new Error('Contact.firstMsgPointer is defined but Contact.lastMsgPointer is not');
    }
  }

  // save message
  setMessageWithID(messageID, message);
}

// Iterates through the conversation history and removes all pending messages that are older than MESSAGE_PENDING_EXPIRATION_TIME.
// TODO: This is inefficient since it iterates through the entire conversation history, but it's probably fine for now. We can optimize later.
export function expirePendingDirectMessages(contactInfo: ContactInfo): boolean {
  console.log(
    '(expirePendingMessages) Expiring pending messages for contact',
    contactInfo.contactID
  );
  const conversation: StoredDirectChatMessage[] =
    !contactInfo.lastMsgPointer || !contactInfo.firstMsgPointer
      ? []
      : (fetchConversation(contactInfo.lastMsgPointer) as StoredDirectChatMessage[]);
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
