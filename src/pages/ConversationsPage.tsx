import { useAtomValue } from 'jotai';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import ConversationsEmptyHeader from '../components/features/Chat/NoConversationsAlert';
import { activeConnectionsAtom, contactInfoAtom } from '../services/atoms';
import { ContactInfo } from '../services/database';
import { fetchMessage } from '../services/message_storage';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContactsInfo = useAtomValue(contactInfoAtom);
  const activeConnections = useAtomValue(activeConnectionsAtom);

  // sort the contacts by connection status, last message interaction time, and date added
  function sortContactsByConnectionStatus(contacts: ContactInfo[]): ContactInfo[] {
    return contacts.sort((contactA: ContactInfo, contactB: ContactInfo) => {
      const isConnectedA = activeConnections.includes(contactA.contactID);
      const isConnectedB = activeConnections.includes(contactB.contactID);

      if (isConnectedA && !isConnectedB) {
        return -1;
      } else if (!isConnectedA && isConnectedB) {
        return 1;
      } else {
        const messageA = contactA.lastMsgPointer ? fetchMessage(contactA.lastMsgPointer) : null;
        const messageB = contactB.lastMsgPointer ? fetchMessage(contactB.lastMsgPointer) : null;
        const messageATime = messageA ? Math.max(messageA.receivedAt, messageA.createdAt) : contactA.dateAdded;
        const messageBTime = messageB ? Math.max(messageB.receivedAt, messageB.createdAt) : contactB.dateAdded;

        return messageATime - messageBTime;
      }
    });
  }


  const sortedContacts = sortContactsByConnectionStatus(Object.values(allContactsInfo));

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Messages" />
      {sortedContacts.length === 0 && <ConversationsEmptyHeader />}
      <ScrollView style={styles.scrollView}>
        {sortedContacts.map((contactInfo: any, index: number) => {
          return (
            <View style={styles.rowContainer} key={index}>
              <ConversationsRow
                navigation={navigation}
                name={contactInfo.nickname}
                contactId={contactInfo.contactID}
                unreadCount={contactInfo.unreadCount}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 5,
    height: '100%',
  },
  rowContainer: {
    paddingLeft: 27,
    marginVertical: 15,
    width: '100%',
    height: 65,
  },
});

export default ConversationsPage;
