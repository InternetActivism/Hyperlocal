import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Message } from './database';

export const connectionsAtom = atom<string[]>([]);
export const messagesRecievedAtom = atom<Map<string, Message[]>>(new Map());
export const allUsersAtom = atom<string[]>([]);
export const pendingMessageAtom = atom<string>('');
