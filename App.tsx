import React from 'react';
import type {ReactNode} from 'react';
import {
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';

import {Button, Input} from '@rneui/themed';

let startListener: EmitterSubscription,
  failedStartListener: EmitterSubscription,
  didConnectListener: EmitterSubscription,
  didDisconnectListener: EmitterSubscription,
  messageSentListener: EmitterSubscription,
  messageSentFailedListener: EmitterSubscription,
  messageReceivedListener: EmitterSubscription;

let connectedUsers: string[] = [];

const createListeners = (
  eventEmitter: NativeEventEmitter,
  onConnect: (userID: string) => void,
  onRecieve: (text: string) => void,
) => {
  startListener = eventEmitter.addListener('onDidStart', data => {
    console.log('sdk did start with data: ', data);
  });

  failedStartListener = eventEmitter.addListener('onFailedToStart', data => {
    console.log('sdk failed to start with data: ', data);
  });

  didConnectListener = eventEmitter.addListener('onDidConnect', data => {
    console.log('sdk did connect with user: ', data);

    connectedUsers.push(data[0]);
    onConnect(data[0]);
  });

  didDisconnectListener = eventEmitter.addListener('onDidDisconnect', data => {
    console.log('sdk did disconnect with user: ', data);

    connectedUsers = connectedUsers.filter(user => user !== data[0]);
  });

  messageSentListener = eventEmitter.addListener('onMessageSent', data => {
    console.log('sdk did send message with data: ', data);
  });

  messageSentFailedListener = eventEmitter.addListener(
    'onMessageSentFailed',
    data => {
      console.log('sdk did fail to send message with data: ', data);
    },
  );

  messageReceivedListener = eventEmitter.addListener(
    'onDidRecieveMessage',
    data => {
      console.log('sdk did receive message with data: ', data);

      onRecieve(data);
    },
  );
};

// need to call this when component unmounts
// might not actually need this since we always need these
// const destroyListeners = () => {
//   startListener.remove();
//   failedStartListener.remove();
//   didConnectListener.remove();
//   didDisconnectListener.remove();
//   messageSentListener.remove();
//   messageSentFailedListener.remove();
//   messageReceivedListener.remove();
// };

const App: () => ReactNode = () => {
  const BridgefySwift = NativeModules.BridgefySwift;
  const [message, setMessage] = React.useState<string>('');
  const [connections, setConnections] = React.useState<string[]>([]);
  const [messagesRecieved, setMessagesRecieved] = React.useState<string[]>([]);

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      setConnections([...connections, userID]);
    }
  };

  const onRecieve = (text: string) => {
    setMessagesRecieved([...messagesRecieved, text]);
  };

  const BridgefySwiftEmit = new NativeEventEmitter(BridgefySwift);
  createListeners(BridgefySwiftEmit, onConnect, onRecieve);

  const onPressSDK = () => {
    BridgefySwift.startSDK((result: any) => {
      console.log(result);
    });
  };

  const sendMessage = () => {
    if (connectedUsers.length === 0) {
      console.log('No connected users');
      return;
    }
    if (message.length === 0) {
      console.log('No message');
      return;
    }
    BridgefySwift.sendMessage(message, connectedUsers[0], (result: any) => {
      console.log(result);
    });
  };

  const ConnectedUsersText = () => {
    return (
      <View>
        {connectedUsers.map(user => {
          return <Text key={user}>{user}</Text>;
        })}
      </View>
    );
  };

  const MessagesRecievedText = () => {
    return (
      <View>
        {messagesRecieved.map(text => {
          return (
            <Text key={text + messagesRecieved.indexOf(text)}>{text}</Text>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.pageContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Connected Users</Text>
          {connectedUsers.length === 0 ? (
            <Text>No connections found</Text>
          ) : (
            <ConnectedUsersText />
          )}
        </View>
        <Button
          buttonStyle={styles.button}
          title="Start SDK"
          onPress={onPressSDK}
        />
        <Input
          style={styles.input}
          placeholder="Enter message"
          onChangeText={value => setMessage(value)}
        />
        <Button
          buttonStyle={styles.button}
          title="Send Message"
          onPress={sendMessage}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Messages Recieved</Text>
          <MessagesRecievedText />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
  },
  sectionContainer: {
    padding: 10,
    marginBottom: 50,
  },
  input: {
    marginTop: 30,
  },
  button: {
    margin: 10,
    height: 40,
    borderRadius: 20,
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default App;
