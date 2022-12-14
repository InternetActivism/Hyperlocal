export const EXPIRATION_TIME = 1000 * 5;
export const SEND_NICKNAME_TO_NON_CONTACTS = true;

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
  USERNAME_UPDATE: 1,
  PUBLIC_INFO: 2,
  CHAT_INVITATION: 3,
};
