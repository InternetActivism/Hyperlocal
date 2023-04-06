/* eslint-disable @typescript-eslint/no-unused-vars */
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Input, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  allContactsAtom,
  conversationCacheAtom,
  getActiveConnectionsAtom,
} from '../services/atoms';
import {
  establishSecureConnection,
  startSDK,
  stopSDK,
  updateLicense,
} from '../services/bridgefy-link';
import { StoredDirectChatMessage, wipeDatabase } from '../services/database';
import { sendChatMessageWrapper } from '../services/transmission';

const DebugPage = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messageRecipient, setMessageRecipient] = React.useState<string>('');
  const [recipient, setRecipient] = React.useState<string>('');

  const [connections] = useAtom(getActiveConnectionsAtom);
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
  const [, setAllUsers] = useAtom(allContactsAtom);
  const navigation = useNavigation<StackNavigationProp<any>>();

  const copyIDToClipboard = (user: string) => {
    Clipboard.setString(user || '');
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

  const MessagesReceivedViews = () => {
    // iterate through conversationCacheAtom
    const allMessages: StoredDirectChatMessage[] = [];
    for (const user in conversationCache) {
      const conversation = conversationCache.get(user);
      if (conversation?.history.length) {
        allMessages.push(...conversation.history);
      }
    }

    return (
      <View>
        {allMessages.map((m) => {
          return (
            <Text key={m.messageID}>{m.messageID + ' ' + m.isReceiver + ' ' + m.content}</Text>
          );
        })}
      </View>
    );
  };

  function directConnect(recipientInput: string) {
    console.log('directConnect debug', recipientInput);
  }

  return (
    <SafeAreaView>
      <View style={styles.pageContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Debug Page</Text>
          <Text>Don't press these if you don't know what you're doing!</Text>

          {connections.length === 0 ? <Text>No connections found</Text> : <ConnectedUsersViews />}
        </View>
        <Button
          buttonStyle={styles.button}
          title="Start SDK"
          onPress={() => startSDK().catch((error) => console.error(error))}
        />
        <Button
          buttonStyle={styles.button}
          title="Stop SDK"
          onPress={() => stopSDK().catch((error) => console.error(error))}
        />

        <Button
          buttonStyle={styles.button}
          title="Onboarding"
          onPress={() => navigation.navigate('Onboarding')}
        />
        <Input
          style={styles.input}
          placeholder="Enter message"
          onChangeText={(value) => setMessage(value)}
        />
        <Input
          style={styles.input}
          placeholder="Enter message recipient"
          onChangeText={(value) => setMessageRecipient(value)}
        />
        <Button
          buttonStyle={styles.button}
          title="Update license"
          onPress={async () => {
            sendChatMessageWrapper(messageRecipient, message);
          }}
        />
        <Input
          style={styles.input}
          placeholder="Enter UUID for direct connection"
          onChangeText={(value) => setRecipient(value)}
        />
        <Button
          buttonStyle={styles.button}
          title="Establish secure connection from UUID"
          onPress={async () => {
            console.log(await establishSecureConnection(recipient));
          }}
        />
        <Button
          buttonStyle={styles.button}
          title="Update license"
          onPress={async () => {
            console.log(await updateLicense());
          }}
        />

        <Button buttonStyle={styles.button} title="Wipe storage" onPress={() => wipeDatabase()} />
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Messages Received</Text>
          <MessagesReceivedViews />
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
    color: '#fff',
  },
});

export default DebugPage;
