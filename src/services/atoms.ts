import { atom } from 'jotai';
import { BridgefyStates } from '../utils/globals';
import { getContactsArray } from './database/contacts';
import { CurrentUserInfo, StoredChatMessage } from './database/database';
import { getConversationHistory } from './database/stored_messages';

export const activeConnectionsAtom = atom<string[]>([]);
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());
export const allContactsAtom = atom<string[]>([]);
export const currentUserInfoAtom = atom<CurrentUserInfo | null>(null);
export const connectionInfoAtom = atom<Map<string, StoredConnectionInfo>>(new Map());
export const bridgefyStatusAtom = atom<number>(BridgefyStates.OFFLINE); // OFFLINE, STARTING, ONLINE, FAILED, BLUETOOTH_OFF, REQUIRES_WIFI

export const getActiveConnectionsAtom = atom<string[]>((get) => {
  return get(activeConnectionsAtom);
});

export const addConnectionAtom = atom(null, (get, set, update: string) => {
  console.log('(addConnection) Set (prev/update):', get(activeConnectionsAtom), update);
  if (get(activeConnectionsAtom).includes(update)) {
    return;
  }
  set(activeConnectionsAtom, [...get(activeConnectionsAtom), update]);
});

export const removeConnectionAtom = atom(null, (get, set, update: string) => {
  console.log('(removeConnection) Set (prev/update):', get(activeConnectionsAtom), update);
  set(
    activeConnectionsAtom,
    get(activeConnectionsAtom).filter((connection) => connection !== update)
  );
});

export const conversationCacheAtomInterface = atom(
  (get) => get(conversationCacheAtom),
  (get, set, update: CachedConversation) => {
    const conversationCache = get(conversationCacheAtom);
    console.log('conversationCacheAtomInterface', conversationCache, update);
    conversationCache.set(update.contactID, update);
    set(conversationCacheAtom, conversationCache);
  }
);

export const connectionInfoAtomInterface = atom(
  (get) => get(connectionInfoAtom),
  (get, set, update: StoredConnectionInfo) => {
    const connectionInfo = get(connectionInfoAtom);
    connectionInfo.set(update.contactID, update);
    set(connectionInfoAtom, connectionInfo);
  }
);

// ------------------ Types ------------------ //

/*
  StoredConnectionInfo 
  Temporarily stored in memory to keep track of connection info.
*/
export interface StoredConnectionInfo {
  contactID: string;
  publicName: string;
  lastUpdated: number;
}

/*
  CachedConversation 
  Used in memory to store a conversation for fast access.
*/
export interface CachedConversation {
  contactID: string;
  history: StoredChatMessage[];
  lastUpdated: number;
}

// ------------------ Utils ------------------ //

// Updates the conversation cache with a new message history for a given contact.
// TODO: Make this more efficient by not wiping the entire cache.
export function updateConversationCacheDeprecated(
  contactID: string,
  history: StoredChatMessage[],
  cache: Map<string, CachedConversation>
): Map<string, CachedConversation> {
  const newCache = new Map(cache);
  newCache.set(contactID, {
    contactID,
    history,
    lastUpdated: Date.now(),
  });
  return newCache;
}

export function createConversationCache(): Map<string, CachedConversation> {
  const contacts = getContactsArray();
  const cache: Map<string, CachedConversation> = new Map();
  for (const contactID of contacts) {
    cache.set(contactID, {
      contactID,
      history: getConversationHistory(contactID),
      lastUpdated: Date.now(),
    });
  }
  return cache;
}
