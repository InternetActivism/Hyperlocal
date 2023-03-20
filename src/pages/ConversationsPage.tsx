import { useAtomValue } from 'jotai';
import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import { allContactsAtom, contactInfoAtom } from '../services/atoms';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContacts = useAtomValue(allContactsAtom);
  const allContactsInfo = useAtomValue(contactInfoAtom);

  const conversationRowViews = () => {
    return allContacts.map((contactID: string, index: number) => {
      const contactInfo = allContactsInfo[contactID];
      const unreadCount = contactInfo.unreadCount ?? 0;

      return (
        <View style={styles.rowContainer} key={index}>
          <ConversationsRow
            navigation={navigation}
            name={contactInfo.nickname}
            contactId={contactInfo.contactID}
            unreadCount={unreadCount}
          />
        </View>
      );
    });
  };

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Conversations" />
      <ScrollView style={styles.scrollView}>{conversationRowViews()}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: '100%',
  },
  rowContainer: {
    paddingHorizontal: 27,
    marginVertical: 15,
    width: '100%',
    height: 65,
  },
});

export default ConversationsPage;
