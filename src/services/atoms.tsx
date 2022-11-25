import { atom } from 'jotai';
import { Message } from './database';

export const connectionsAtom = atom<string[]>([]);
export const messagesRecievedAtom = atom<Message[]>([]);
export const allUsersAtom = atom<string[]>([]);
export const pendingMessageAtom = atom<string>('');
