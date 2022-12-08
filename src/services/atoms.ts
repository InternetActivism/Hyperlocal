import { atom } from 'jotai';
import { UserInfo, Message } from './database';

export const connectionsAtom = atom<string[]>([]);
export const messagesRecievedAtom = atom<Map<string, Message[]>>(new Map());
export const allUsersAtom = atom<string[]>([]);
export const userInfoAtom = atom<UserInfo | null>(null);
