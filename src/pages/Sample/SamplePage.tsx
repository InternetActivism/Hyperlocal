import { Button, Input, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { connectionsAtom, messagesRecievedAtom } from '../../services/atoms';
import { sendMessage, startSDK } from '../../services/bridgefy-link';
import { Message, wipeDatabase } from '../../services/database';

const SampleApp = () => {
  const [message, setMessage] = React.useState<string>('');
  const [connections, setConnections] = useAtom(connectionsAtom);
  const [messagesRecieved, setMessagesRecieved] = useAtom(messagesRecievedAtom);

  // console.log(
  //   'sample| messagesRecieved:',
  //   messagesRecieved,
  //   ' connections: ',
  //   connections,
  // );

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
    const allMessages: Message[] | undefined = messagesRecieved.get(
      connections[0],
    );
    if (allMessages === undefined) {
      return <></>;
    }
    return (
      <View>
        {allMessages.map((text: Message) => {
          return (
            <Text key={text.text + allMessages.indexOf(text)}>{text.text}</Text>
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
        <Button
          buttonStyle={styles.button}
          title="Wipe storage"
          onPress={() => {
            wipeDatabase();
          }}
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
