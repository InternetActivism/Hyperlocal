import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

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
export const createListeners = (
  onStart: () => void,
  onFailedToStart: (error: string) => void,
  onStop: () => void,
  onFailedToStop: (error: string) => void,
  onConnect: (userID: string) => void,
  onDisconnect: (userID: string) => void,
  onEstablishedSecureConnection: (userID: string) => void,
  onFailedToEstablishSecureConnection: (userID: string, error: string) => void,
  onMessageReceived: (
    contactID: string,
    messageID: string,
    raw: string,
    transmission: string
  ) => void,
  onMessageSent: (messageID: string) => void,
  onMessageSentFailed: (messageID: string, error: string) => void
) => {
  console.log('(createListeners) Starting listeners...');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStart,
    (data) => {
      console.log('(startListener): ', data);
      onStart();
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedStartListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToStart,
    (data) => {
      console.log('(failedStartListener): ', data);
      onFailedToStart(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStop,
    (data) => {
      console.log('(stopListener): ', data);
      onStop();
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedToStopListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidFailToStop,
    (data) => {
      console.log('(failedToStopListener): ', data);
      onFailedToStop(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didConnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidConnect,
    (data) => {
      console.log('(didConnectListener): ', data);

      onConnect(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didDisconnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDisconnect,
    (data) => {
      console.log('(didDisconnectListener): ', data);

      onDisconnect(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const establishedSecureConnectionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onEstablishedSecureConnection,
    (data) => {
      console.log('(establishedSecureConnectionListener): ', data);
      onEstablishedSecureConnection(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedToEstablishSecureConnectionListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToEstablishSecureConnection,
    (data) => {
      console.log('(failedToEstablishSecureConnectionListener): ', data);
      onFailedToEstablishSecureConnection(data[0], data[1]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSent,
    (data) => {
      console.log('(messageSentListener): ', data[0]);
      onMessageSent(data[0]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentFailedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSentFailed,
    (data) => {
      console.log('(messageSentFailedListener): ', data);
      onMessageSentFailed(data[0], data[1]);
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageReceivedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidRecieveMessage,
    (data) => {
      console.log('(messageReceivedListener): ', data);
      onMessageReceived(data[2], data[1], data[0], data[3]);
    }
  );
};

export async function startSDK(): Promise<string> {
  console.log('(startSDK) Starting Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.startSDK(callbackHandler(resolve, reject));
  });
}

export async function sendMessage(
  message: string,
  userID: string,
  transmission: string = 'p2p'
): Promise<string> {
  console.log('(sendMessage) Sending message to: ', userID, message, transmission);
  return new Promise((resolve, reject) => {
    BridgefySwift.sendMessage(message, userID, callbackHandler(resolve, reject), transmission);
  });
}

export async function getUserId(): Promise<string> {
  console.log('(getUserId) Fetching user ID from Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.getUserId(callbackHandler(resolve, reject));
  });
}
