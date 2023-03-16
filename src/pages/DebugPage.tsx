/* eslint-disable @typescript-eslint/no-unused-vars */
import Clipboard from '@react-native-clipboard/clipboard';
import { Button, Input, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { allContactsAtom, conversationCacheAtom, getActiveConnectionsAtom } from 'services/atoms';
import { startSDK, stopSDK } from 'services/bridgefy-link';
import { StoredChatMessage, wipeDatabase } from 'services/database';

const DebugPage = () => {
  const [message, setMessage] = React.useState<string>('');
  const [recipient, setRecipient] = React.useState<string>('');
  const [connections] = useAtom(getActiveConnectionsAtom);
  const [conversationCache, setConversationCache] = useAtom(conversationCacheAtom);
  const [, setAllUsers] = useAtom(allContactsAtom);

  const copyIDToClipboard = (user: string) => {
    Clipboard.setString(user || '');
  };

  const sendText = async () => {
    // if (recipient !== '' && message !== '') {
    //   if (!isContact) {
    //     setContactInfo(recipient, {
    //       contactID: recipient,
    //       nickname: recipient,
    //       contactFlags: 0,
    //       verified: false, // used in future versions
    //       lastSeen: -1,
    //     });
    //     setAllUsers(addContactToArray(recipient));
    //   }
    //   let messageID = await sendMessageWrapper(recipient, {
    //     content: message,
    //     flags: MessageType.TEXT,
    //     createdAt: Date.now(),
    //   });
    //   console.log('(sendText) Message sent with ID', messageID);
    //   console.log('(sendText) New conversation history', getConversationHistory(recipient));
    //   // update conversation cache for UI updates
    //   setConversationCache(
    //     updateConversationCacheDeprecated(
    //       recipient,
    //       getConversationHistory(recipient),
    //       conversationCache
    //     )
    //   );
    // }
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
    // iterate through conversationCacheAtom
    const allMessages: StoredChatMessage[] = [];
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

export default DebugPage;
