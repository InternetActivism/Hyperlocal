export const MESSAGE_PENDING_EXPIRATION_TIME = 1000 * 5;
export const CHAT_INVITATION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 1 week
export const SEND_NICKNAME_TO_NON_CONTACTS = true;
export const NULL_UUID = '00000000-0000-0000-0000-000000000000';

export const BridgefyStates = {
  OFFLINE: 0,
  STARTING: 1,
  ONLINE: 2,
  FAILED: 3,
  BLUETOOTH_OFF: 4,
  REQUIRES_WIFI: 5,
};

export const MessageStatus = {
  SUCCESS: 0,
  PENDING: 1,
  FAILED: 2,
  DELETED: 3,
};

export const MessageType = {
  TEXT: 0,
  NICKNAME_UPDATE: 1,
  PUBLIC_INFO: 2,
  CHAT_INVITATION: 3,
  CHAT_INVITATION_RESPONSE: 4,
};