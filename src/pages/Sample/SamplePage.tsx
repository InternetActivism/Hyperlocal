import Clipboard from '@react-native-clipboard/clipboard';
import { Button, Input, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { connectionsAtomWithListener, messagesRecievedAtom } from '../../services/atoms';
import { sendMessage, startSDK } from '../../services/bridgefy-link';
import { Message, storage, wipeDatabase } from '../../services/database/database';

const SampleApp = () => {
  const [message, setMessage] = React.useState<string>('');
  const [recipient, setRecipient] = React.useState<string>('');
  const [connections] = useAtom(connectionsAtomWithListener);
  const [messagesRecieved] = useAtom(messagesRecievedAtom);

  // console.log(
  //   'sample| messagesRecieved:',
  //   messagesRecieved,
  //   ' connections: ',
  //   connections,
  // );

  const copyIDToClipboard = (user: string) => {
    Clipboard.setString(user || '');
  };

  const sendText = () => {
    if (recipient !== '' && message !== '') {
      sendMessage(message, recipient);
    }
  };

  const ConnectedUsersViews = () => {
    return (
      <View>
        {connections.map((user) => {
          return (
            <Text onPress={() => copyIDToClipboard(user)} key={user}>
              {user}
            </Text>
          );
        })}
      </View>
    );
  };

  const MessagesRecievedViews = () => {
    const allUsersString: string | undefined = storage.getString('all_users');
    const allUsers: string[] = allUsersString ? JSON.parse(allUsersString) : [];

    const allMessages: Map<string, Message[]> = new Map();
    for (const user of allUsers) {
      const messages = messagesRecieved.get(user);
      if (messages) {
        allMessages.set(user, messages);
      }
    }

    return (
      <View>
        {Array.from(allMessages).map(([user, messages]) => {
          return UserMessages(user, messages);
        })}
      </View>
    );
  };

  const UserMessages = (user: string, messages: Message[]) => {
    return (
      <View>
        <Text>{user}</Text>
        {messages.map((m) => {
          return <Text>{m.messageID + ' ' + m.isReciever + ' ' + m.text}</Text>;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.pageContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Debug Page</Text>
          <Text>Don't press these if you don't know what you're doing!</Text>

          {connections.length === 0 ? <Text>No connections found</Text> : <ConnectedUsersViews />}
        </View>
        <Button buttonStyle={styles.button} title="Start SDK" onPress={() => startSDK()} />
        <Input
          style={styles.input}
          placeholder="Enter message"
          onChangeText={(value) => setMessage(value)}
        />
        <Input
          style={styles.input}
          placeholder="Enter recipient"
          onChangeText={(value) => setRecipient(value)}
        />
        <Button buttonStyle={styles.button} title="Send Message" onPress={() => sendText()} />
        <Button buttonStyle={styles.button} title="Wipe storage" onPress={() => wipeDatabase()} />
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
