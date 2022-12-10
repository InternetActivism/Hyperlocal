import { atom } from 'jotai';
import { UserInfo, Message } from './database';

export const connectionsAtom = atom<string[]>([]);
export const messagesRecievedAtom = atom<Map<string, Message[]>>(new Map());
export const allUsersAtom = atom<string[]>([]);
export const userInfoAtom = atom<UserInfo | null>(null);

export const connectionsAtomWithListener = atom<string[]>(get => {
  //   console.log('(connectionsAtomWithListener) Get:', get(connectionsAtom));
  return get(connectionsAtom);
}, null);

export const addConnectionAtom = atom(null, (get, set, update: string) => {
  console.log(
    '(addConnection) Set (prev/update):',
    get(connectionsAtom),
    update,
  );
  set(connectionsAtom, [...get(connectionsAtom), update]);
});

export const removeConnectionAtom = atom(null, (get, set, update: string) => {
  console.log(
    '(removeConnection) Set (prev/update):',
    get(connectionsAtom),
    update,
  );
  set(
    connectionsAtom,
    get(connectionsAtom).filter(connection => connection !== update),
  );
});
