import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import { logEvent } from '../utils/analytics';
import {
  ConnectData,
  DisconnectData,
  EstablishedSecureConnectionData,
  EventPacket,
  EventType,
  FailedToDestroySessionData,
  FailedToEstablishSecureConnectionData,
  FailedToStartData,
  FailedToStopData,
  MessageReceivedData,
  MessageSentData,
  MessageSentFailedData,
  SessionDestroyedData,
  StartData,
  StopData,
  TransmissionMode,
  TransmissionModeType,
} from '../utils/globals';

const BridgefyModule = NativeModules.BridgefyModule;
export const eventEmitter = new NativeEventEmitter(BridgefyModule);

export enum supportedEvents {
  onDidStart = 'onDidStart',
  onFailedToStart = 'onFailedToStart',
  onDidStop = 'onDidStop',
  onDidFailToStop = 'onDidFailToStop',
  onDidConnect = 'onDidConnect',
  onDidDisconnect = 'onDidDisconnect',
  onEstablishedSecureConnection = 'onEstablishedSecureConnection',
  onFailedToEstablishSecureConnection = 'onFailedToEstablishSecureConnection',
  onMessageSent = 'onMessageSent',
  onMessageSentFailed = 'onMessageSentFailed',
  onDidReceiveMessage = 'onDidReceiveMessage',
  onDidDestroySession = 'onDidDestroySession',
  onDidFailToDestroySession = 'onDidFailToDestroySession',
}

function callbackHandler(resolve: (value: any) => void, reject: (reason?: any) => void) {
  return (error: boolean, result: string) => {
    if (error) {
      reject(parseInt(result, 10));
    }
    resolve(result);
  };
}

/*

  Bridgefy Link
  This is the bridge between the native Bridgefy SDK and the React Native app.
  This is a singleton class, so we can only have one instance of it at a time.

*/

// do these listeners need to be destroyed at any point?
export const linkListenersToEvents = (handleEvent: (event: EventPacket) => void) => {
  console.log('(linkListenersToEvents) Starting listeners...');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStart,
    (data) => {
      console.log('(startListener): ', data);
      handleEvent({ type: EventType.START, data: {} as StartData });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedStartListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToStart,
    (data) => {
      console.log('(failedStartListener): ', data);
      handleEvent({
        type: EventType.FAILED_TO_START,
        data: { error: data.error } as FailedToStartData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStop,
    (data) => {
      console.log('(stopListener): ', data);
      handleEvent({
        type: EventType.STOP,
        data: {} as StopData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedToStopListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidFailToStop,
    (data) => {
      console.log('(failedToStopListener): ', data);
      handleEvent({
        type: EventType.FAILED_TO_STOP,
        data: { error: data.error } as FailedToStopData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didConnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidConnect,
    (data) => {
      console.log('(didConnectListener): ', data);
      handleEvent({ type: EventType.CONNECT, data: { userID: data.userID } as ConnectData });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didDisconnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDisconnect,
    (data) => {
      console.log('(didDisconnectListener): ', data);
      handleEvent({ type: EventType.DISCONNECT, data: { userID: data.userID } as DisconnectData });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const establishedSecureConnectionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onEstablishedSecureConnection,
    (data) => {
      console.log('(establishedSecureConnectionListener): ', data);
      handleEvent({
        type: EventType.ESTABLISHED_SECURE_CONNECTION,
        data: { userID: data.userID } as EstablishedSecureConnectionData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedToEstablishSecureConnectionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToEstablishSecureConnection,
    (data) => {
      console.log('(failedToEstablishSecureConnectionListener): ', data);
      handleEvent({
        type: EventType.FAILED_TO_ESTABLISH_SECURE_CONNECTION,
        data: { userID: data.userID, error: data.error } as FailedToEstablishSecureConnectionData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSent,
    (data) => {
      console.log('(messageSentListener): ', data.messageID);
      handleEvent({
        type: EventType.MESSAGE_SENT,
        data: { messageID: data.messageID } as MessageSentData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentFailedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSentFailed,
    (data) => {
      console.log('(messageSentFailedListener): ', data);
      handleEvent({
        type: EventType.MESSAGE_SENT_FAILED,
        data: { messageID: data.messageID, error: data.error } as MessageSentFailedData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageReceivedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidReceiveMessage,
    (data) => {
      console.log('(messageReceivedListener): ', data);
      handleEvent({
        type: EventType.MESSAGE_RECEIVED,
        data: {
          contactID: data.contactID,
          messageID: data.messageID,
          raw: data.raw,
          transmission: data.transmission,
        } as MessageReceivedData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sessionDestroyedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDestroySession,
    (data) => {
      console.log('(sessionDestroyedListener): ', data);
      handleEvent({
        type: EventType.SESSION_DESTROYED,
        data: {} as SessionDestroyedData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedToDestroySessionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidFailToDestroySession,
    (data) => {
      console.log('(failedToDestroySessionListener): ', data);
      handleEvent({
        type: EventType.FAILED_TO_DESTROY_SESSION,
        data: {} as FailedToDestroySessionData,
      });
    }
  );
};

export async function refreshSDK(): Promise<void> {
  console.log('(refreshSDK) Restarting Bridgefy...');
  // TODO: add this to firebase events. await logEvent('refreshSDK');
  await stopSDK().catch((e) => {
    console.warn(e);
    return;
  });
  await startSDK().catch((e) => {
    console.warn(e);
    return;
  });
  return Promise.resolve();
}

export async function startSDK(): Promise<string> {
  console.log('(startSDK) Starting Bridgefy...');
  await logEvent('startSDK');
  return new Promise((resolve, reject) => {
    BridgefyModule.startSDK(callbackHandler(resolve, reject));
  });
}

export async function stopSDK(): Promise<string> {
  console.log('(stopSDK) Stopping Bridgefy...');
  await logEvent('stopSDK');
  return new Promise((resolve, reject) => {
    BridgefyModule.stopSDK(callbackHandler(resolve, reject));
  });
}

export async function sendMessage(
  message: string,
  userID: string,
  transmission: TransmissionModeType = TransmissionMode.P2P
): Promise<string> {
  console.log('(sendMessage) Sending message to: ', userID, message, transmission);
  await logEvent('sendMessage', { userID, transmission });
  return new Promise((resolve, reject) => {
    BridgefyModule.sendMessage(message, userID, transmission, callbackHandler(resolve, reject));
  });
}

export async function getUserId(): Promise<string> {
  console.log('(getUserId) Fetching user ID from Bridgefy...');
  await logEvent('getUserId');
  return new Promise((resolve, reject) => {
    BridgefyModule.getUserId(callbackHandler(resolve, reject));
  });
}

export async function getConnectedPeers(): Promise<string[]> {
  console.log('(getConnectedPeers) Fetching connected peers from Bridgefy...');
  await logEvent('getConnectedPeers');
  return new Promise((resolve, reject) => {
    BridgefyModule.getConnectedPeers(callbackHandler(resolve, reject));
  });
}

export async function updateLicense(): Promise<string> {
  console.log('(updateLicense) Updating license...');
  await logEvent('updateLicense');
  return new Promise((resolve, reject) => {
    BridgefyModule.updateLicense(callbackHandler(resolve, reject));
  });
}

export async function establishSecureConnection(userID: string): Promise<string> {
  console.log('(establishSecureConnection) Establishing secure connection with: ', userID);
  await logEvent('establishSecureConnection', { userID });
  return new Promise((resolve, reject) => {
    BridgefyModule.establishSecureConnection(userID, callbackHandler(resolve, reject));
  });
}

export async function destroySession(): Promise<string> {
  console.log('(destroySession) Destroying session...');
  await logEvent('destroySession');
  return new Promise((resolve, reject) => {
    BridgefyModule.destroySession(callbackHandler(resolve, reject));
  });
}
