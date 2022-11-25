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
  onConnect: (userID: string) => void,
  onDisconnect: (userID: string) => void,
  onRecieve: (message: string[]) => void,
  onSent: (message: string) => void,
) => {
  console.log('create listeners called');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidStart,
    data => {
      console.log('sdk did start with data: ', data);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const failedStartListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onFailedToStart,
    data => {
      console.log('sdk failed to start with data: ', data);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didConnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidConnect,
    data => {
      console.log('sdk did connect with user: ', data);

      onConnect(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const didDisconnectListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidDisconnect,
    data => {
      console.log('sdk did disconnect with user: ', data);

      onDisconnect(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onMessageSent,
    data => {
      console.log('sdk did send message with data: ', data);

      onSent(data[0]);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageSentFailedListener: EmitterSubscription =
    eventEmitter.addListener(supportedEvents.onMessageSentFailed, data => {
      console.log('sdk did fail to send message with data: ', data);
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageReceivedListener: EmitterSubscription = eventEmitter.addListener(
    supportedEvents.onDidRecieveMessage,
    data => {
      console.log('sdk did receive message with data: ', data);

      onRecieve(data);
    },
  );
};

export const startSDK = () => {
  BridgefySwift.startSDK((result: any) => {
    console.log(result);
  });
};

export const sendMessage = (message: string, userID: string) => {
  BridgefySwift.sendMessage(message, userID, (result: any) => {
    console.log(result);
  });
};
