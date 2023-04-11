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

// List of Bridgefy states that are considered errors
export const BridgefyErrorStates: number[] = [
  BridgefyStates.FAILED,
  BridgefyStates.BLUETOOTH_OFF,
  BridgefyStates.BLUETOOTH_PERMISSION_REJECTED,
  BridgefyStates.REQUIRES_WIFI,
];

export const BridgefyErrors = {
  SIMULATOR_NOT_SUPPORTED: 0,
  NOT_STARTED: 1,
  ALREADY_INSTANTIATED: 2,
  START_IN_PROGRESS: 3,
  ALREADY_STARTED: 4,
  SERVICE_NOT_STARTED: 5,
  MISSING_BUNDLE_ID: 6,
  INVALID_API_KEY: 7,
  INTERNET_CONNECTION_REQUIRED: 8,
  SESSION_ERROR: 9,
  EXPIRED_LICENSE: 10,
  INCONSISTENT_DEVICE_TIME: 11,
  BLE_USAGE_NOT_GRANTED: 12,
  BLE_USAGE_RESTRICTED: 13,
  BLE_POWERED_OFF: 14,
  BLE_UNSUPPORTED: 15,
  BLE_UNKNOWN_ERROR: 16,
  INCONSISTENT_CONNECTION: 17,
  CONNECTION_IS_ALREADY_SECURE: 18,
  CANNOT_CREATE_SECURE_CONNECTION: 19,
  DATA_LENGTH_EXCEEDED: 20,
  DATA_VALUE_IS_EMPTY: 21,
  PEER_IS_NOT_CONNECTED: 22,
  INTERNAL_ERROR: 23,
  LICENSE_ERROR: 24,
  STORAGE_ERROR: 25,
  ENCODING_ERROR: 26,
  ENCRYPTION_ERROR: 27,
  NOT_INITIALIZED: 28,
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
  PUBLIC_CHAT_MESSAGE: 5,
};

export enum StoredMessageType {
  STORED_PUBLIC_MESSAGE = 0,
  STORED_DIRECT_MESSAGE,
}

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
  transmission: string;
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

export const TransmissionMode = {
  P2P: 'p2p',
  MESH: 'mesh',
  BROADCAST: 'broadcast',
};
