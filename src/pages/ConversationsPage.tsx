import { useAtomValue } from 'jotai';
import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import { conversationCacheAtom } from '../services/atoms';
import { allContactsAtom } from '../services/atoms/contacts';
import { getContactInfo } from '../services/contacts';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContacts = useAtomValue(allContactsAtom);
  const conversationCache = useAtomValue(conversationCacheAtom);

  const conversationRowViews = () => {
    return allContacts.map((contactID: string, index: number) => {
      const contactInfo = getContactInfo(contactID);
      const unreadCount = conversationCache.get(contactID)?.unreadCount || 0;

      // All conversations should have contact info. If not, throw an error.
      if (!contactInfo) {
        console.log(contactID);
        throw new Error('Contact info not found in ConversationsPage');
      }

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
