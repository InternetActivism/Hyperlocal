import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import {
  ConnectData,
  DisconnectData,
  EventPacket,
  EventType,
  FailedToStartData,
  MessageReceivedData,
  MessageSentData,
  MessageSentFailedData,
  StartData,
} from '../utils/globals';

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
      handleEvent({ type: EventType.START, data: { userID: data[0] } as StartData });
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
        } as MessageReceivedData,
      });
    }
  );
};

export async function startSDK() {
  console.log('(startSDK) Starting Bridgefy...');
  return new Promise((resolve, reject) => {
    BridgefySwift.startSDK(callbackHandler(resolve, reject));
  });
}

export async function sendMessage(message: string, userID: string): Promise<string> {
  console.log('(sendMessage) Sending message to: ', userID, message);
  return new Promise((resolve, reject) => {
    BridgefySwift.sendMessage(message, userID, callbackHandler(resolve, reject));
  });
}
