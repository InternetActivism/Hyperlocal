import { MessageStatus, MessageType } from '../utils/globals';
import { sendMessage } from './bridgefy-link';
import { ChatInvitation, CHAT_INVITATION_KEY, storage } from './database';
import { saveChatMessageToStorage } from './stored_messages';

// ------------------- TRANSMISSION MESSAGE TYPES --------------------- //

/*
  Message
  Type of all messages sent over the mesh network.
*/
export type Message =
  | TextMessagePacket
  | NicknameUpdatePacket
  | ChatInvitationPacket
  | ConnectionInfoPacket;

/*
  RawMessage 
  Interface of all packets sent over the mesh network.
*/
export interface RawMessage {
  flags: number;
  createdAt: number; // unix timestamp
}

/*
  TextMessagePacket 
  Format that we stringify and send over mesh network
*/
export interface TextMessagePacket extends RawMessage {
  message: string;
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
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

// Share public information about the user.
export async function sendConnectionInfoWrapper(
  contactID: string,
  publicName: string
): Promise<string> {
  const messageObject: ConnectionInfoPacket = {
    publicName: publicName,
    flags: MessageType.PUBLIC_INFO,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  return messageID;
}

// Send a text message.
// Assumes that the contact exists.
export async function sendChatMessageWrapper(
  contactID: string,
  message_text: string
): Promise<string> {
  const messageObject: TextMessagePacket = {
    message: message_text,
    flags: MessageType.TEXT,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  console.log('(sendMessageWrapper) Creating new message');
  saveChatMessageToStorage(contactID, messageID, {
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: MessageType.TEXT,
    statusFlag: MessageStatus.PENDING,
    content: message_text,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}

// Send a nickname update.
// Assumes that the contact exists.
export async function sendNicknameUpdateWrapper(
  contactID: string,
  nickname: string
): Promise<string> {
  const messageObject: NicknameUpdatePacket = {
    nickname: nickname,
    flags: MessageType.NICKNAME_UPDATE,
    createdAt: Date.now(),
  };
  const messageRaw = JSON.stringify(messageObject);
  const messageID = await sendMessage(messageRaw, contactID);

  console.log('(sendMessageWrapper) Creating new message');
  saveChatMessageToStorage(contactID, messageID, {
    messageID,
    contactID,
    isReceiver: false,
    typeFlag: MessageType.NICKNAME_UPDATE,
    statusFlag: MessageStatus.PENDING,
    content: nickname,
    createdAt: Date.now(), // unix timestamp
    receivedAt: -1, // not a received message
  });

  return messageID;
}
