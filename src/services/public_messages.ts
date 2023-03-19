import { MessageStatus, MESSAGE_PENDING_EXPIRATION_TIME } from '../utils/globals';
import { PublicChatInfo, StoredPublicChatMessage } from './database';
import { fetchConversation, fetchMessage, setMessageWithID } from './message_storage';

// ------------------ Public Chat Message Functions ------------------ //

// Saves a message to the database.
export function savePublicChatMessageToStorage(
  publicChatInfo: PublicChatInfo,
  message: StoredPublicChatMessage
) {
  console.log('(savePublicChatMessageToStorage) Saving message to database.', message);
  const messageID: string = message.messageID;

  // set message pointers
  message.prevMsgPointer = publicChatInfo?.lastMsgPointer;
  message.nextMsgPointer = undefined;

  // set publicChatInfo pointers
  if (publicChatInfo?.lastMsgPointer) {
    const lastMessage = fetchMessage(publicChatInfo.lastMsgPointer);
    lastMessage.nextMsgPointer = messageID;
    setMessageWithID(lastMessage.messageID, lastMessage);
  } else {
    console.log(
      "(savePublicChatMessageToStorage) First message: publicChatInfo doesn't have a last message pointer."
    );
    if (publicChatInfo?.firstMsgPointer) {
      throw new Error('firstMsgPointer is defined but lastMsgPointer is not');
    }
  }

  // save message
  setMessageWithID(messageID, message);
}

// Iterates through the conversation history and removes all pending messages that are older than MESSAGE_PENDING_EXPIRATION_TIME.
// TODO: This is inefficient since it iterates through the entire conversation history, but it's probably fine for now. We can optimize later.
export function expirePublicPendingMessages(chatInfo: PublicChatInfo): boolean {
  console.log('(expirePublicPendingMessages) Expiring pending messages for contact');
  if (!chatInfo.lastMsgPointer) {
    return false;
  }

  const conversation = fetchConversation(chatInfo.lastMsgPointer);
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
