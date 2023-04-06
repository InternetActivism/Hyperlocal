import { useAtomValue } from 'jotai';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import ConversationsEmptyHeader from '../components/features/Chat/NoConversationsAlert';
import { contactInfoAtom } from '../services/atoms';
import { ContactInfo } from '../services/database';
import { fetchMessage } from '../services/message_storage';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContactsInfo = useAtomValue(contactInfoAtom);

  // sort conversations by last message sent, or if no messages, by date added
  function sortContactConversations(contacts: ContactInfo[]): ContactInfo[] {
    return contacts.sort((contactA: ContactInfo, contactB: ContactInfo) => {
      if (!contactA.lastMsgPointer && contactB.lastMsgPointer) {
        return 1;
      } else if (contactA.lastMsgPointer && !contactB.lastMsgPointer) {
        return -1;
      } else if (!contactA.lastMsgPointer && !contactB.lastMsgPointer) {
        return contactA.dateCreated - contactB.dateCreated;
      } else if (contactA.lastMsgPointer && contactB.lastMsgPointer) {
        const lastMessageA = fetchMessage(contactA.lastMsgPointer);
        const lastMessageB = fetchMessage(contactB.lastMsgPointer);

        const lastMessageTimeA = lastMessageA.isReceiver
          ? lastMessageA.receivedAt
          : lastMessageA.createdAt;
        const lastMessageTimeB = lastMessageB.isReceiver
          ? lastMessageB.receivedAt
          : lastMessageB.createdAt;

        return lastMessageTimeB - lastMessageTimeA;
      }

      return 0;
    });
  }

  const sortedContacts = sortContactConversations(Object.values(allContactsInfo));

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
