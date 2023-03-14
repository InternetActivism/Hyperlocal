import {
  ChatInvitationPacket,
  ConnectionInfoPacket,
  Message,
  NicknameUpdatePacket,
  PublicChatMessagePacket,
  TextMessagePacket,
} from '../services/transmission';
import { MessageType } from './globals';

export function isMessageText(message: Message): message is TextMessagePacket {
  return message.flags === MessageType.TEXT;
}

export function isMessageNicknameUpdate(message: Message): message is NicknameUpdatePacket {
  return message.flags === MessageType.NICKNAME_UPDATE;
}

export function isMessagePublicInfo(message: Message): message is ConnectionInfoPacket {
  return message.flags === MessageType.PUBLIC_INFO;
}

export function isMessageChatInvitation(message: Message): message is ChatInvitationPacket {
  return message.flags === MessageType.CHAT_INVITATION;
}

export function isMessageChatInvitationResponse(message: Message): message is ChatInvitationPacket {
  return message.flags === MessageType.CHAT_INVITATION_RESPONSE;
}

export function isMessagePublicChatMessage(message: Message): message is PublicChatMessagePacket {
  return message.flags === MessageType.PUBLIC_CHAT_MESSAGE;
}
