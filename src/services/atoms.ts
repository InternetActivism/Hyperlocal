import { atom } from 'jotai';
import { Content } from '../components/ui/InAppNotification';
import { atomWithMMKV } from '../utils/atomWithMMKV';
import { BridgefyState, BridgefyStatus } from '../utils/globals';
import {
  ContactInfo,
  CONTACT_INFO_KEY,
  CurrentUserInfo,
  CURRENT_USER_INFO_KEY,
  PublicChatInfo,
  PUBLIC_CHAT_INFO_KEY,
  StoredDirectChatMessage,
  StoredPublicChatMessage,
  wipeDatabase,
} from './database';

// ------------------ Atoms ------------------ //

// activeConnectionsAtom: List of active connections.
export const activeConnectionsAtom = atom<string[]>([]);

// TODO: (adriangri) use MMKV atom
// connectionInfoAtom: Map of connection IDs to connection info (public name, last seen, etc.).
export const connectionInfoAtom = atom<Map<string, StoredConnectionInfo>>(new Map());

// conversationCacheAtom: Map of contactIDs to conversation histories.
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());

// publicChatCacheAtom: Public chat conversation history.
export const publicChatCacheAtom = atom<CachedPublicConversation>({ history: [], lastUpdated: 0 });

// publicChatInfoAtom: Public chat info
export const publicChatInfoAtom = atomWithMMKV<PublicChatInfo>(PUBLIC_CHAT_INFO_KEY, {
  lastUpdated: 0,
  unreadCount: 0,
});

// currentUserInfoAtom: Current user's info.
export const currentUserInfoAtom = atomWithMMKV<CurrentUserInfo>(CURRENT_USER_INFO_KEY, {
  userID: null,
  nickname: '',
  userFlags: 0,
  privacy: 0, // used in future versions
  verified: false, // used in future versions
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  isOnboarded: false,
  isInitialized: false,
});

// bridgefyStatusAtom: Bridgefy status.
export const bridgefyStatusAtom = atom<BridgefyState>(BridgefyStatus.OFFLINE);

export const currentViewAtom = atom<string | null>(null);

export const appVisibleAtom = atom<string>('active');

export const notificationContentAtom = atom<Content | undefined>(undefined);

export const disableRefreshAtom = atom<boolean>(false);

export const createChatWithUserAtom = atom<string | undefined>(undefined);

// allContactsAtom: List of all contacts.
export const allContactsAtom = atom<string[]>((get) => {
  const contactInfo = get(contactInfoAtom);
  return Object.keys(contactInfo);
});

export const contactInfoAtom = atomWithMMKV<{ [key: string]: ContactInfo }>(CONTACT_INFO_KEY, {});

// Unread count for conversations and public chat.
export const unreadCountAtom = atom<UnreadCount>((get) => {
  const publicChatInfo = get(publicChatInfoAtom);
  const contactInfo = get(contactInfoAtom);
  const allContacts = get(allContactsAtom);
  let totalConversationUnreadCount = 0;
  let publicChatUnreadCount = publicChatInfo.unreadCount;
  allContacts.forEach((contactID) => {
    const contact = contactInfo[contactID];
    if (contact) {
      totalConversationUnreadCount += contact.unreadCount;
    }
  });
  return { totalConversationUnreadCount, publicChatUnreadCount };
});

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
    const connectionInfo = new Map(get(connectionInfoAtom));
    connectionInfo.set(update.contactID, update);
    set(connectionInfoAtom, connectionInfo);
  }
);

// TODO: (adriangri) Find a better solution to this
export const resetAllDataAtom = atom(null, (get, set) => {
  wipeDatabase();
  set(activeConnectionsAtom, []);
  set(connectionInfoAtom, new Map());
  set(conversationCacheAtom, new Map());
  set(publicChatCacheAtom, { history: [], lastUpdated: 0 });
  set(publicChatInfoAtom, {
    lastUpdated: 0,
    unreadCount: 0,
  });
  set(currentUserInfoAtom, {
    userID: null,
    nickname: '',
    userFlags: 0,
    privacy: 0, // used in future versions
    verified: false, // used in future versions
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    isOnboarded: false,
    isInitialized: false,
  });
  set(currentViewAtom, null);
  set(appVisibleAtom, 'active');
  set(notificationContentAtom, undefined);
  set(disableRefreshAtom, false);
  set(createChatWithUserAtom, undefined);
  set(contactInfoAtom, {});
});

// ------------------ Types ------------------ //

/*
  StoredConnectionInfo
  Temporarily stored in memory to keep track of connection info.
*/

export enum SecureStatus {
  NOT_SECURE = 0,
  PENDING,
  SECURE,
  FAILED,
}

export interface StoredConnectionInfo {
  contactID: string;
  publicName: string;
  lastUpdated: number;
  secureStatus: SecureStatus;
}

/*
  CachedConversation
  Used in memory to store a conversation for fast access.
*/
export interface CachedConversation {
  contactID: string;
  history: StoredDirectChatMessage[];
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

/*
  UnreadCount
  Used in memory to store the unread count for conversations and public chat.
*/
export interface UnreadCount {
  totalConversationUnreadCount: number;
  publicChatUnreadCount: number;
}

// ------------------ Utils ------------------ //

// Updates the unread message count for a given contact.
export function updateUnreadCount(
  contactID: string,
  history: StoredDirectChatMessage[],
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
