import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

const BridgefySwift = NativeModules.BridgefySwift;
const eventEmitter = new NativeEventEmitter(BridgefySwift);

enum supportedEvents {
  onDidStart = 'onDidStart',
  onFailedToStart = 'onFailedToStart',
  onDidConnect = 'onDidConnect',
  onDidDisconnect = 'onDidDisconnect',
  onMessageSent = 'onMessageSent',
  onMessageSentFailed = 'onMessageSentFailed',
  onDidRecieveMessage = 'onDidRecieveMessage',
}

/*

  Bridgefy Link
  This is the bridge between the native Bridgefy SDK and the React Native app.
  This is a singleton class, so we can only have one instance of it at a time.

*/

// do these listeners need to be destroyed at any point?
export const createListeners = (
  onStart: (userID: string) => void,
  onFailedToStart: (error: string) => void,
  onConnect: (userID: string) => void,
  onDisconnect: (userID: string) => void,
  onMessageReceived: (contactID: string, messageID: string, raw: string) => void,
  onMessageSent: (messageID: string) => void,
  onMessageSentFailed: (messageID: string, error: string) => void
) => {
  console.log('(createListeners) Starting listeners...');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStart,
    (data) => {
      console.log('(startListener): ', data);
      onStart(data[0]);
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
      onMessageReceived(data[2], data[1], data[0]);
    }
  );
};

export async function startSDK() {
  console.log('(startSDK) Starting Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.startSDK((result: any) => {
      console.log('(startSDK)', result);
      if (result === 'Error') {
        reject(result);
      }
      resolve(result);
    });
  });
}

export async function sendMessage(message: string, userID: string): Promise<string> {
  console.log('(sendMessage) Sending message to: ', userID);
  return new Promise((resolve, reject) => {
    BridgefySwift.sendMessage(message, userID, (result: any) => {
      if (result === 'Error') {
        reject(result);
      }
      resolve(result);
    });
  });
}
