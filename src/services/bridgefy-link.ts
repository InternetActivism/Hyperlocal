import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

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

// do these listeners need to be destroyed at any point?
export const createListeners = (
  onStart: (bridgefyID: string) => void,
  onConnect: (userID: string) => void,
  onDisconnect: (userID: string) => void,
  onMessageReceived: (message: string[]) => void,
  onMessageSent: (message: string) => void,
) => {
  console.log('(createListeners) Starting listeners...');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStart,
    data => {
      console.log('(startListener): ', data);
      onStart(data);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedStartListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToStart,
    data => {
      console.log('(failedStartListener): ', data);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didConnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidConnect,
    data => {
      console.log('(didConnectListener): ', data);

      onConnect(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didDisconnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDisconnect,
    data => {
      console.log('(didDisconnectListener): ', data);

      onDisconnect(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSent,
    data => {
      console.log('(messageSentListener): ', data);

      onMessageSent(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentFailedListener: EmitterSubscription =
    eventEmitter.addListener(supportedEvents.onMessageSentFailed, data => {
      console.log('(messageSentFailedListener): ', data);
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageReceivedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidRecieveMessage,
    data => {
      console.log('(messageReceivedListener): ', data);

      onMessageReceived(data);
    },
  );
};

export const startSDK = () => {
  BridgefySwift.startSDK((result: any) => {
    console.log('(startSDK)', result);
  });
};

export function sendMessage(message: string, userID: string): string {
  return BridgefySwift.sendMessage(message, userID, (result: any) => {
    console.log('(sendMessage)', result);
    return result;
  });
}