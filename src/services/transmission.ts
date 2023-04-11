import { MessageStatus, MessageType, StoredMessageType, TRANSMISSION_MODE } from '../utils/globals';
import { sendMessage } from './bridgefy-link';
import {
  ChatInvitation,
  CHAT_INVITATION_KEY,
  ContactInfo,
  storage,
  StoredDirectChatMessage,
  StoredPublicChatMessage,
} from './database';
import { saveChatMessageToStorage } from './direct_messages';

// ------------------- TRANSMISSION MESSAGE TYPES --------------------- //

/*
  Message Transmission Versioning
  Since we can't assume clients will be on the same version, especially since most clients will not have access to the internet for extended periods of time, we need to version our messages and ensure that we can handle messages from older versions. We'll increment this number every time we make a breaking change to the message format.

  0: Pre-versioning (before 2023-04-05)
  1: Initial version (2023-04-05)

*/
export enum MESSAGE_TRANSMISSION_VERSION {
  PRE_VERSIONING = 0,
  INITIAL,
}
/*
  Message
  Type of all messages sent over the mesh network.
*/
export type Message =
  | TextMessagePacket
  | NicknameUpdatePacket
  | ChatInvitationPacket
  | ConnectionInfoPacket
  | PublicChatMessagePacket;

/*
  RawMessage
  Interface of all packets sent over the mesh network.
*/
export interface RawMessage {
  flags: number;
  createdAt: number; // unix timestamp
  version?: MESSAGE_TRANSMISSION_VERSION.INITIAL;
}

/*
  TextMessagePacket
  Format that we stringify and send over mesh network
*/
export interface TextMessagePacket extends RawMessage {
  message: string;
}

/*
  PublicChatMessagePacket
  Format that we stringify and send over mesh network
*/
export interface PublicChatMessagePacket extends RawMessage {
  message: string;
  nickname: string;
}

/*
  NicknameUpdatePacket
  Format that we stringify and send over mesh network
*/
export interface NicknameUpdatePacket extends RawMessage {
  nickname: string;
}

/*
  ConnectionInfoPacket
  Format that we stringify and send over mesh network
*/
export interface ConnectionInfoPacket extends RawMessage {
  senderID: string; // This is for debug, as due to the wrong ID connection issue
  publicName: string;
}

/*
  ChatInvitationPacket
  Format that we stringify and send over mesh network.
*/
export interface ChatInvitationPacket extends RawMessage {
  requestHash: string;
  accepted?: boolean; // only used if the user is the receiver
  nickname: string;
  // insert personal information that's private here
}

// ------------------- TRANSMISSION FUNCTIONS --------------------- //

// Invite a user to chat.
export async function sendChatInvitationWrapper(
  contactID: string,
  nickname: string
): Promise<string> {
  // In the future we'll pass along sensitive user info with the invitation that we can't share publicly to random connections
  const messageObject: ChatInvitationPacket = {
    nickname: nickname,
    requestHash: Math.random().toString(36).substring(7),
    flags: MessageType.CHAT_INVITATION,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  // save the invitation to storage
  const invitation: ChatInvitation = {
    requestHash: messageObject.requestHash,
    invitedID: contactID,
    createdAt: Date.now(),
  };
  storage.set(CHAT_INVITATION_KEY(contactID), JSON.stringify(invitation));

  return messageID;
}

// Respond to a chat invitation.
export async function sendChatInvitationResponseWrapper(
  contactID: string,
  nickname: string,
  requestHash: string,
  accepted: boolean
): Promise<string> {
  const messageObject: ChatInvitationPacket = {
    nickname: nickname,
    requestHash: requestHash,
    accepted: accepted,
    flags: MessageType.CHAT_INVITATION_RESPONSE,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

// Share public information about the user.
export async function sendConnectionInfoWrapper(
  senderID: string,
  contactID: string,
  publicName: string
): Promise<string> {
  const messageObject: ConnectionInfoPacket = {
    senderID: senderID,
    publicName: publicName,
    flags: MessageType.PUBLIC_INFO,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

// Send a text message.
// Assumes that the contact exists.
export async function sendChatMessageWrapper(
  contactID: string,
  messageText: string,
  transmission: TRANSMISSION_MODE
): Promise<StoredDirectChatMessage> {
  const messageObject: TextMessagePacket = {
    message: messageText,
    flags: MessageType.TEXT,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID, transmission);

  console.log('(sendMessageWrapper) Creating new message');
  const message: StoredDirectChatMessage = {
    type: StoredMessageType.STORED_DIRECT_MESSAGE,
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: MessageType.TEXT,
    statusFlag: MessageStatus.PENDING,
    content: messageText,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  };

  return message;
}

// Send a text message to the Public Chat.
export async function sendPublicChatMessageWrapper(
  nickname: string,
  senderID: string,
  messageText: string
): Promise<StoredPublicChatMessage> {
  const messageObject: PublicChatMessagePacket = {
    nickname,
    message: messageText,
    flags: MessageType.PUBLIC_CHAT_MESSAGE,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, senderID, 'broadcast');

  console.log('(sendPublicChatMessageWrapper) Creating new pubilc chat message');
  const message: StoredPublicChatMessage = {
    type: StoredMessageType.STORED_PUBLIC_MESSAGE,
    messageID,
    senderID,
    isReceiver: false,
    nickname,
    statusFlag: MessageStatus.PENDING,
    content: messageText,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  };

  return message;
}

// Send a nickname update.
// Assumes that the contact exists.
export async function sendNicknameUpdateWrapper(
  contactInfo: ContactInfo,
  nickname: string
): Promise<string> {
  const messageObject: NicknameUpdatePacket = {
    nickname: nickname,
    flags: MessageType.NICKNAME_UPDATE,
    createdAt: Date.now(),
    version: MESSAGE_TRANSMISSION_VERSION.INITIAL,
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactInfo.contactID);

  console.log('(sendMessageWrapper) Creating new message');
  saveChatMessageToStorage(contactInfo, messageID, {
    type: StoredMessageType.STORED_DIRECT_MESSAGE,
    messageID,
    contactID: contactInfo.contactID,
    isReceiver: false,
    typeFlag: MessageType.NICKNAME_UPDATE,
    statusFlag: MessageStatus.PENDING,
    content: nickname,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}
