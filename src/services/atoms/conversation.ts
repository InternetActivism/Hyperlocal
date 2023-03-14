import { atom } from 'jotai';
import { CachedConversation, conversationCacheAtom } from '../atoms';
import { StoredDirectChatMessage } from '../database';
import {
  expirePendingDirectMessages,
  getDirectConversationHistory,
  saveChatMessageToStorage,
} from '../direct_messages';
import { setMessageWithID } from '../message_storage';

export const addMessageToConversationAtom = atom(
  null,
  (get, set, update: StoredDirectChatMessage) => {
    saveChatMessageToStorage(update.contactID, update.messageID, update);
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
  const didExpire = expirePendingDirectMessages(update);

  if (didExpire) {
    set(syncConversationInCacheAtom, update);
  }
});

// TODO: (adriangri) make this more efficient
export const syncConversationInCacheAtom = atom(null, (get, set, update: string) => {
  const conversationCache: Map<string, CachedConversation> = new Map(get(conversationCacheAtom));
  const unreadCount: number = conversationCache.get(update)?.unreadCount ?? 0;
  const history = getDirectConversationHistory(update);
  const conversation: CachedConversation = {
    contactID: update,
    history,
    lastUpdated: Date.now(),
    unreadCount,
  };
  conversationCache.set(update, conversation);

  set(conversationCacheAtom, conversationCache);
});
