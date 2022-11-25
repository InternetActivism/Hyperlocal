import { atom } from 'jotai';
import { CurrentUser, Message } from './database';

export const connectionsAtom = atom<string[]>([]);
export const messagesRecievedAtom = atom<Map<string, Message[]>>(new Map());
export const allUsersAtom = atom<string[]>([]);
export const pendingMessageAtom = atom<string>('');
export const currentUserInfoAtom = atom<CurrentUser | null>(null);
