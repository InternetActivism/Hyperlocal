import { atom } from 'jotai';
import { CachedConversation, ConnectionInfo, CurrentUserInfo } from './database/database';

export const activeConnectionsAtom = atom<string[]>([]);
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());
export const allContactsAtom = atom<string[]>([]);
export const currentUserInfoAtom = atom<CurrentUserInfo | null>(null);
export const connectionInfoAtom = atom<Map<string, ConnectionInfo>>(new Map());

export const getActiveConnectionsAtom = atom<string[]>((get) => {
  return get(activeConnectionsAtom);
});

export const addConnectionAtom = atom(null, (get, set, update: string) => {
  console.log('(addConnection) Set (prev/update):', get(activeConnectionsAtom), update);
  set(activeConnectionsAtom, [...get(activeConnectionsAtom), update]);
});

export const removeConnectionAtom = atom(null, (get, set, update: string) => {
  console.log('(removeConnection) Set (prev/update):', get(activeConnectionsAtom), update);
  set(
    activeConnectionsAtom,
    get(activeConnectionsAtom).filter((connection) => connection !== update)
  );
});

export const setConversationInfoAtom = atom(null, (get, set, update: CachedConversation) => {
  const conversationCache = get(conversationCacheAtom);
  conversationCache.set(update.contactID, update);
  set(conversationCacheAtom, conversationCache);
});

export const connectionInfoAtomInterface = atom(
  (get) => get(connectionInfoAtom),
  (get, set, update: ConnectionInfo) => {
    const connectionInfo = get(connectionInfoAtom);
    connectionInfo.set(update.contactID, update);
    set(connectionInfoAtom, connectionInfo);
  }
);
