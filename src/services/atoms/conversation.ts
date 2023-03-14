import { atom } from 'jotai';
import { CachedConversation, conversationCacheAtom } from '../atoms';
import { StoredChatMessage } from '../database';
import {
  expirePendingMessages,
  getConversationHistory,
  saveChatMessageToStorage,
  setMessageWithID,
} from '../stored_messages';
import { allContactsAtom } from './contacts';

export const addMessageToConversationAtom = atom(null, (get, set, update: StoredChatMessage) => {
  saveChatMessageToStorage(update.contactID, update.messageID, update);
  set(syncConversationInCacheAtom, update.contactID);
});

export const updateMessageInConversationAtom = atom(
  null,
  (get, set, update: { messageID: string; message: StoredChatMessage }) => {
    setMessageWithID(update.messageID, update.message);
    set(syncConversationInCacheAtom, update.message.contactID);
  }
);

export const expirePendingMessagesAtom = atom(null, (get, set, update: string) => {
  const didExpire = expirePendingMessages(update);

  if (didExpire) {
    set(syncConversationInCacheAtom, update);
  }
});

// TODO: make this more efficient
export const syncConversationInCacheAtom = atom(null, (get, set, update: string) => {
  const conversationCache: Map<string, CachedConversation> = new Map(get(conversationCacheAtom));
  const unreadCount: number = conversationCache.get(update)?.unreadCount ?? 0;
  const history = getConversationHistory(update);
  const conversation: CachedConversation = {
    contactID: update,
    history,
    lastUpdated: Date.now(),
    unreadCount,
  };
  conversationCache.set(update, conversation);

  set(conversationCacheAtom, conversationCache);
});

export const createConversationCacheAtom = atom(null, (get, set) => {
  const contacts = get(allContactsAtom);
  if (!contacts) {
    return;
  }
  for (const contactID of contacts) {
    set(syncConversationInCacheAtom, contactID);
  }
});
