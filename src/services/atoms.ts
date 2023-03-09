import { atom } from 'jotai';
import { BridgefyStates } from '../utils/globals';
import { getContactsArray } from './contacts';
import { CurrentUserInfo, StoredChatMessage, StoredPublicChatMessage } from './database';
import { getConversationHistory } from './stored_messages';

// ------------------ Atoms ------------------ //

// activeConnectionsAtom: List of active connections.
export const activeConnectionsAtom = atom<string[]>([]);

// connectionInfoAtom: Map of connection IDs to connection info (public name, last seen, etc.).
export const connectionInfoAtom = atom<Map<string, StoredConnectionInfo>>(new Map());

// allContactsAtom: List of all contacts in database.
export const allContactsAtom = atom<string[]>([]);

// conversationCacheAtom: Map of contactIDs to conversation histories.
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());

// conversationCacheAtom: Map of contactIDs to conversation histories.
export const publicChatCacheAtom = atom<CachedPublicConversation | null>(null);

// currentUserInfoAtom: Current user's info.
export const currentUserInfoAtom = atom<CurrentUserInfo | null>(null);

// bridgefyStatusAtom: Bridgefy status.
export const bridgefyStatusAtom = atom<number>(BridgefyStates.OFFLINE); // OFFLINE, STARTING, ONLINE, FAILED, BLUETOOTH_OFF, REQUIRES_WIFI

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

// Updates the conversation cache with a new message history for a given contact.
// Was previously deprecated but for some reason Jotai doesn't like it removed. Kept for now.
// TODO: Make this more efficient by not setting the entire cache.
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

// Creates a new conversation cache.
// Goes through all contacts and pulls their conversation history from the database.
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
