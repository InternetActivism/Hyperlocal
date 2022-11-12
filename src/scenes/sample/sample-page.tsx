import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useAtom } from 'jotai';
import { connectionsAtom } from '../../services/atoms';
import {
  addMessageToStorage,
  getMessagesFromStorage,
  Message,
} from '../../services/database';
import {
  createListeners,
  startSDK,
  sendMessage,
} from '../../services/bridgefy-link';
import { Button, Input, Text } from '@rneui/themed';

const SampleApp = () => {
  const [message, setMessage] = React.useState<string>('');
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = React.useState<Message[]>([]);

  const onConnect = (userID: string) => {
    if (!connections.includes(userID)) {
      console.log(connections);
      console.log(userID);
      setConnections([...connections, userID]);
      setMessagesRecieved(getMessagesFromStorage(userID));
    }
  };

  const onRecieve = (message: string[]) => {
    if (connections.length === 0) {
      console.log('no connections');
      return;
    }
    addMessageToStorage(connections[0], message[0], message[1], true);
    setMessagesRecieved(getMessagesFromStorage(connections[0]));
    // setMessagesRecieved([...messagesRecieved, text]);
  };

  createListeners(onConnect, onRecieve);

  const sendText = () => {
    if (connections.length === 0) {
      console.log('No connected users');
      return;
    }
    if (message.length === 0) {
      console.log('No message');
      return;
    }
    sendMessage(message, connections[0]);
  };

  const ConnectedUsersViews = () => {
    return (
      <View>
        {connections.map(user => {
          return <Text key={user}>{user}</Text>;
        })}
      </View>
    );
  };

  const MessagesRecievedViews = () => {
    return (
      <View>
        {messagesRecieved.map(text => {
          return (
            <Text key={text.text + messagesRecieved.indexOf(text)}>
              {text.text}
            </Text>
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
          {connections.length === 0 ? (
            <Text>No connections found</Text>
          ) : (
            <ConnectedUsersViews />
          )}
        </View>
        <Button
          buttonStyle={styles.button}
          title="Start SDK"
          onPress={startSDK}
        />
        <Input
          style={styles.input}
          placeholder="Enter message"
          onChangeText={value => setMessage(value)}
        />
        <Button
          buttonStyle={styles.button}
          title="Send Message"
          onPress={sendText}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Messages Recieved</Text>
          <MessagesRecievedViews />
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
    fontFamily: 'Rubik-Medium',
  },
});

export default SampleApp;
