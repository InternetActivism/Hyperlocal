import { atom } from 'jotai';
import { CachedConversation, CurrentUserInfo } from './database/database';

export const activeConnectionsAtom = atom<string[]>([]);
export const conversationCacheAtom = atom<Map<string, CachedConversation>>(new Map());
export const allContactsAtom = atom<string[]>([]);
export const currentUserInfoAtom = atom<CurrentUserInfo | null>(null);

export const getActiveConnectionsAtom = atom<string[]>((get) => {
  //   console.log('(getActiveConnectionsAtom) Get:', get(activeConnectionsAtom));
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
