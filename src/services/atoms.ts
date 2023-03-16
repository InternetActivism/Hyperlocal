import { atom } from 'jotai';
import { BridgefyStates } from 'utils/globals';
import { getContactInfo, getContactsArray } from './contacts';
import {
  ContactInfo,
  CurrentUserInfo,
  StoredChatMessage,
  StoredPublicChatMessage,
} from './database';
import { getConversationHistory } from './stored_messages';

// ------------------ Atoms ------------------ //

// activeConnectionsAtom: List of active connections.
export const activeConnectionsAtom = atom<string[]>([]);

// TODO: (adriangri) use MMKV atom
// connectionInfoAtom: Map of connection IDs to connection info (public name, last seen, etc.).
export const connectionInfoAtom = atom<Map<string, StoredConnectionInfo>>(new Map());

// TODO: (adriangri) use MMKV atom
// allContactsAtom: List of all contacts in database.
export const allContactsAtom = atom<string[]>([]);

// conversationCacheAtom: Map of contactIDs to conversation histories.
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());

// TODO: (adriangri) Use MMKV atom
// currentUserInfoAtom: Current user's info.
export const currentUserInfoAtom = atom<CurrentUserInfo | null>(null);

// bridgefyStatusAtom: Bridgefy status.
export const bridgefyStatusAtom = atom<number>(BridgefyStates.OFFLINE); // OFFLINE, STARTING, ONLINE, FAILED, BLUETOOTH_OFF, REQUIRES_WIFI

export const chatContactAtom = atom<string | null>(null);

// ------------------ Atoms (Interface) ------------------ //
// A lot of these are useless and just for debugging purposes.
// Once we figure out how to use Jotai right, we can remove these.

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
  unreadCount: number;
}

/*
  CachedPublicConversation
  Used in memory to store the public chat conversation for fast access.
*/
export interface CachedPublicConversation {
  history: StoredPublicChatMessage[];
  lastUpdated: number;
}

// ------------------ Utils ------------------ //

// Updates the unread message count for a given contact.
export function updateUnreadCount(
  contactID: string,
  history: StoredChatMessage[],
  cache: Map<string, CachedConversation>,
  unreadCount: number
) {
  const newCache: Map<string, CachedConversation> = new Map(cache);
  newCache.set(contactID, {
    contactID,
    history,
    lastUpdated: Date.now(),
    unreadCount,
  });
  return newCache;
}

// Creates a new conversation cache.
// Goes through all contacts and pulls their conversation history from the database.
export function createConversationCache(): Map<string, CachedConversation> {
  const contacts = getContactsArray();
  const cache: Map<string, CachedConversation> = new Map();
  for (const contactID of contacts) {
    const contactInfo: ContactInfo = getContactInfo(contactID);

    cache.set(contactID, {
      contactID,
      history: getConversationHistory(contactID),
      lastUpdated: Date.now(),
      unreadCount: contactInfo.unreadCount,
    });
  }
  return cache;
}
