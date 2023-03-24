import { atom } from 'jotai';
import { publicChatCacheAtom, publicChatInfoAtom } from '../atoms';
import { StoredPublicChatMessage } from '../database';
import { fetchConversation, setMessageWithID } from '../message_storage';
import { expirePublicPendingMessages, savePublicChatMessageToStorage } from '../public_messages';

export const setUnreadCountPublicChatAtom = atom(null, (get, set, unreadCount: number) => {
  set(publicChatInfoAtom, (prev) => ({ ...prev, unreadCount }));
});

export const addMessageToPublicChatAtom = atom(
  null,
  (get, set, update: StoredPublicChatMessage) => {
    const publicChatInfo = get(publicChatInfoAtom);

    if (publicChatInfo.lastMsgPointer) {
      set(publicChatInfoAtom, {
        ...publicChatInfo,
        lastMsgPointer: update.messageID,
      });
    } else {
      if (publicChatInfo.firstMsgPointer) {
        throw new Error('firstMsgPointer is defined but lastMsgPointer is not');
      }
      set(publicChatInfoAtom, {
        ...publicChatInfo,
        lastMsgPointer: update.messageID,
        firstMsgPointer: update.messageID,
      });
    }

    savePublicChatMessageToStorage(publicChatInfo, update);
    set(syncPublicChatInCacheAtom);
  }
);

export const updateMessageInPublicChatAtom = atom(
  null,
  (get, set, update: { messageID: string; message: StoredPublicChatMessage }) => {
    setMessageWithID(update.messageID, update.message);
    set(syncPublicChatInCacheAtom);
  }
);

export const expirePublicPendingMessagesAtom = atom(null, (get, set) => {
  const chatInfo = get(publicChatInfoAtom);
  const didExpire = expirePublicPendingMessages(chatInfo);

  if (didExpire) {
    set(syncPublicChatInCacheAtom);
  }
});

export const syncPublicChatInCacheAtom = atom(null, (get, set) => {
  const publicChatInfo = get(publicChatInfoAtom);
  if (!publicChatInfo.lastMsgPointer || !publicChatInfo.firstMsgPointer) {
    set(publicChatCacheAtom, { history: [], lastUpdated: Date.now() });
    return;
  }

  const history: StoredPublicChatMessage[] = fetchConversation(
    publicChatInfo.lastMsgPointer
  ) as StoredPublicChatMessage[];
  set(publicChatCacheAtom, { history, lastUpdated: Date.now() });
});
