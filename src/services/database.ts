import { MMKV } from 'react-native-mmkv';
import { sendMessage } from './bridgefy-link';
import { addPendingMessage } from './messages';

export const storage = new MMKV();

/*

  Rules for storage:
    Timestamps are in milliseconds since epoch. Store as number.

  Storage interface {
    `user_info`: UserInfo // gets the current user
    `all_users`: string[] // gets all users that you have a conversation with
    `pending-{messageid}`: string // gets the pending message
    `u-{contactid}`: ContactInfo // gets the contact info for a user
    `m-{contactid}|{index}`: Message // gets the message from a conversation at index
  }

*/

// format of a user's personal info
export interface UserInfo {
  name: string;
  userID: string;
  dateCreated: number;
  dateUpdated: number;
}

// format of a contact in the contact list
export interface ContactInfo {
  name: string;
  contactID: string;
  lastSeen: number;
  lastMessageIndex: number;
}

// this is the format that we store in storage
export interface Message {
  index: number;
  messageID: string;
  text: string;
  timestamp: number;
  isReciever: boolean;
  flags: number;
}

// this is the format that we stringify and send over bridgefy
// flags is a bitfield, for now only the first bit is used to indicate if the message is a username update
// 1 = username update, 0 = normal message
export interface RawMessage {
  text: string;
  flags: number;
}

// an interface for a message that has not been confirmed sent yet
// saved temporarily in storage until we get a confirmation from bridgefy
// once we get a confirmation, we remove the pending message from storage
export interface PendingMessage {
  recipient: string;
  messageID: string;
  text: string;
  timestamp: number;
  flags: number;
}

export function getArrayOfConvos(): string[] {
  const allUsersString: string | undefined = storage.getString('all_users');
  return allUsersString ? JSON.parse(allUsersString) : [];
}

export function wipeDatabase() {
  console.log('(wipeDatabase) Wiping database');
  storage.clearAll();
}

export async function sendMessageWrapper(
  messageText: string,
  flags: number,
  contactId: string,
): Promise<boolean> {
  const messageObj: RawMessage = {
    text: messageText,
    flags: flags,
  };
  const messageRaw = JSON.stringify(messageObj);
  const messageID = await sendMessage(messageRaw, contactId);
  addPendingMessage({
    messageID,
    text: messageText,
    timestamp: Date.now(),
    recipient: contactId,
    flags: flags,
  });

  return true;
}
