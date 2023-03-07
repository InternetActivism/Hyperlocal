export const MESSAGE_PENDING_EXPIRATION_TIME = 1000 * 5;
export const CHAT_INVITATION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 1 week
export const SEND_NICKNAME_TO_NON_CONTACTS = true;
export const NULL_UUID = '00000000-0000-0000-0000-000000000000';

export const BridgefyStates = {
  OFFLINE: 0,
  STARTING: 1,
  ONLINE: 2,
  FAILED: 3,
  BLUETOOTH_PERMISSION_REJECTED: 4,
  BLUETOOTH_OFF: 5,
  REQUIRES_WIFI: 6,
  SIMULATOR: 7,
};

export const BridgefyErrors = {
  SIMULATOR_NOT_SUPPORTED: 0,
  NOT_STARTED: 1,
  ALREADY_STARTED: 2,
  MISSING_BUNDLE_ID: 3,
  INVALID_API_KEY_FORMAT: 4,
  INTERNET_CONNECTION_REQUIRED: 5,
  SESSION_ERROR: 6,
  EXPIRED_LICENCE: 7,
  INCONSISTENT_DEVICE_TIME: 8,
  BLE_USAGE_NOT_GRANTED: 9,
  BLE_USAGE_RESTRICTED: 10,
  BLE_POWERED_OFF: 11,
  BLE_UNSUPPORTED: 12,
  BLE_UNKNOWN_ERROR: 13,
  DATA_LENGTH_EXCEEDED: 14,
  DATA_VALUE_IS_EMPTY: 15,
  PEER_NOT_CONNECTED: 16,
  LICENCE_ERROR: 17,
  STORAGE_ERROR: 18,
  ENCODING_ERROR: 19,
  ENCRYPTION_ERROR: 20,
  UNKNOWN_ERROR: -1,
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

export enum EventType {
  START = 0,
  FAILED_TO_START,
  STOP,
  FAILED_TO_STOP,
  CONNECT,
  DISCONNECT,
  ESTABLISHED_SECURE_CONNECTION,
  FAILED_TO_ESTABLISH_SECURE_CONNECTION,
  MESSAGE_RECEIVED,
  MESSAGE_SENT,
  MESSAGE_SENT_FAILED,
}

export interface StartData {}

export interface FailedToStartData {
  error: string;
}

export interface StopData {}

export interface FailedToStopData {
  error: string;
}

export interface ConnectData {
  userID: string;
}

export interface DisconnectData {
  userID: string;
}

export interface EstablishedSecureConnectionData {
  userID: string;
}

export interface FailedToEstablishSecureConnectionData {
  userID: string;
  error: string;
}

export interface MessageReceivedData {
  contactID: string;
  messageID: string;
  raw: string;
}

export interface MessageSentData {
  messageID: string;
}

export interface MessageSentFailedData {
  messageID: string;
  error: string;
}

export type EventData =
  | StartData
  | FailedToStartData
  | StopData
  | FailedToStopData
  | ConnectData
  | DisconnectData
  | EstablishedSecureConnectionData
  | FailedToEstablishSecureConnectionData
  | MessageReceivedData
  | MessageSentData
  | MessageSentFailedData;

export type EventPacket =
  | { type: EventType.START; data: StartData }
  | { type: EventType.FAILED_TO_START; data: FailedToStartData }
  | { type: EventType.STOP; data: StopData }
  | { type: EventType.FAILED_TO_STOP; data: FailedToStopData }
  | { type: EventType.CONNECT; data: ConnectData }
  | { type: EventType.DISCONNECT; data: DisconnectData }
  | { type: EventType.ESTABLISHED_SECURE_CONNECTION; data: EstablishedSecureConnectionData }
  | {
      type: EventType.FAILED_TO_ESTABLISH_SECURE_CONNECTION;
      data: FailedToEstablishSecureConnectionData;
    }
  | { type: EventType.MESSAGE_RECEIVED; data: MessageReceivedData }
  | { type: EventType.MESSAGE_SENT; data: MessageSentData }
  | { type: EventType.MESSAGE_SENT_FAILED; data: MessageSentFailedData };
