import { atom } from 'jotai';
import { CachedConversation, contactInfoAtom, conversationCacheAtom } from '../atoms';
import { ContactInfo, StoredDirectChatMessage } from '../database';
import { expirePendingDirectMessages, saveChatMessageToStorage } from '../direct_messages';
import { fetchConversation, setMessageWithID } from '../message_storage';

export const addMessageToConversationAtom = atom(
  null,
  (get, set, update: StoredDirectChatMessage) => {
    const allContactsInfo = get(contactInfoAtom);
    const contactInfo: ContactInfo | undefined = allContactsInfo[update.contactID];
    if (!contactInfo) {
      throw new Error('(addMessageToConversationAtom) Contact not found');
    }

    if (contactInfo.lastMsgPointer) {
      allContactsInfo[update.contactID] = {
        ...contactInfo,
        lastMsgPointer: update.messageID,
      };
    } else {
      allContactsInfo[update.contactID] = {
        ...contactInfo,
        lastMsgPointer: update.messageID,
        firstMsgPointer: update.messageID,
      };
    }
    set(contactInfoAtom, { ...allContactsInfo });

    saveChatMessageToStorage(contactInfo, update.messageID, update);
    set(syncConversationInCacheAtom, update.contactID);
  }
);

export const updateMessageInConversationAtom = atom(
  null,
  (get, set, update: { messageID: string; message: StoredDirectChatMessage }) => {
    setMessageWithID(update.messageID, update.message);
    set(syncConversationInCacheAtom, update.message.contactID);
  }
);

export const expirePendingMessagesAtom = atom(null, (get, set, update: string) => {
  const contactInfo: ContactInfo | undefined = get(contactInfoAtom)[update];
  if (!contactInfo) {
    throw new Error('(expirePendingMessagesAtom) Contact not found');
  }

  const didExpire = expirePendingDirectMessages(contactInfo);

  if (didExpire) {
    set(syncConversationInCacheAtom, update);
  }
});

// TODO: (adriangri) make this more efficient
export const syncConversationInCacheAtom = atom(null, (get, set, update: string) => {
  const conversationCache: Map<string, CachedConversation> = new Map(get(conversationCacheAtom));
  const contactInfo: ContactInfo | undefined = get(contactInfoAtom)[update];
  if (!contactInfo) {
    throw new Error('(syncConversationInCacheAtom) Contact not found');
  }

  const unreadCount: number = contactInfo.unreadCount ?? 0;
  const history: StoredDirectChatMessage[] =
    !contactInfo.lastMsgPointer || !contactInfo.firstMsgPointer
      ? []
      : (fetchConversation(contactInfo.lastMsgPointer) as StoredDirectChatMessage[]);
  const conversation: CachedConversation = {
    contactID: update,
    history,
    lastUpdated: Date.now(),
    unreadCount,
  };
  conversationCache.set(update, conversation);

  set(conversationCacheAtom, conversationCache);
});

export const setConversationUnreadCountAtom = atom(
  null,
  (get, set, update: { contactID: string; unreadCount: number }) => {
    const allContacts = get(contactInfoAtom);
    allContacts[update.contactID].unreadCount = update.unreadCount;
    set(contactInfoAtom, { ...allContacts });
  }
);
