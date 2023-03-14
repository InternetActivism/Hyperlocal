import { atom } from 'jotai';
import { atomWithMMKV } from '../../utils/atomWithMMKV';
import { CONTACT_ARRAY_KEY } from '../database';

// allContactsAtom: List of all contacts.
export const allContactsAtom = atomWithMMKV<string[]>(CONTACT_ARRAY_KEY, []);

export const addContactAtom = atom(null, (get, set, update: string) => {
  const contacts = get(allContactsAtom);
  if (contacts.includes(update)) {
    return;
  }
  set(allContactsAtom, [...contacts, update]);
});
