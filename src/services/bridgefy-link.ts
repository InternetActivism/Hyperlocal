import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import {
  ConnectData,
  DisconnectData,
  EstablishedSecureConnectionData,
  EventPacket,
  EventType,
  FailedToEstablishSecureConnectionData,
  FailedToStartData,
  FailedToStopData,
  MessageReceivedData,
  MessageSentData,
  MessageSentFailedData,
  StartData,
  StopData,
} from 'utils/globals';

const BridgefySwift = NativeModules.BridgefySwift;
const eventEmitter = new NativeEventEmitter(BridgefySwift);

enum supportedEvents {
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
  onDidRecieveMessage = 'onDidRecieveMessage',
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
        data: { error: data[0] } as FailedToStartData,
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
        data: { error: data[0] } as FailedToStopData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didConnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidConnect,
    (data) => {
      console.log('(didConnectListener): ', data);
      handleEvent({ type: EventType.CONNECT, data: { userID: data[0] } as ConnectData });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didDisconnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDisconnect,
    (data) => {
      console.log('(didDisconnectListener): ', data);
      handleEvent({ type: EventType.DISCONNECT, data: { userID: data[0] } as DisconnectData });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const establishedSecureConnectionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onEstablishedSecureConnection,
    (data) => {
      console.log('(establishedSecureConnectionListener): ', data);
      handleEvent({
        type: EventType.ESTABLISHED_SECURE_CONNECTION,
        data: { userID: data[0] } as EstablishedSecureConnectionData,
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
        data: { userID: data[0], error: data[1] } as FailedToEstablishSecureConnectionData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSent,
    (data) => {
      console.log('(messageSentListener): ', data[0]);
      handleEvent({
        type: EventType.MESSAGE_SENT,
        data: { messageID: data[0] } as MessageSentData,
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
        data: { messageID: data[0], error: data[1] } as MessageSentFailedData,
      });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageReceivedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidRecieveMessage,
    (data) => {
      console.log('(messageReceivedListener): ', data);
      handleEvent({
        type: EventType.MESSAGE_RECEIVED,
        data: {
          contactID: data[2],
          messageID: data[1],
          raw: data[0],
          transmission: data[3],
        } as MessageReceivedData,
      });
    }
  );
};

export async function startSDK(): Promise<string> {
  console.log('(startSDK) Starting Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.startSDK(callbackHandler(resolve, reject));
  });
}

export async function stopSDK(): Promise<string> {
  console.log('(stopSDK) Stopping Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.stopSDK(callbackHandler(resolve, reject));
  });
}

export async function sendMessage(
  message: string,
  userID: string,
  transmission: string = 'p2p'
): Promise<string> {
  console.log('(sendMessage) Sending message to: ', userID, message, transmission);
  return new Promise((resolve, reject) => {
    BridgefySwift.sendMessage(message, userID, transmission, callbackHandler(resolve, reject));
  });
}

export async function getUserId(): Promise<string> {
  console.log('(getUserId) Fetching user ID from Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.getUserId(callbackHandler(resolve, reject));
  });
}

export async function getConnectedPeers(): Promise<string> {
  console.log('(getConnectedPeers) Fetching connected peers from Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.getConnectedPeers(callbackHandler(resolve, reject));
  });
}
