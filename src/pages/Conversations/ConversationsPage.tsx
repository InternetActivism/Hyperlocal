import { useAtomValue } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ConversationsRow } from '../../components';
import { allContactsAtom } from '../../services/atoms';
import { getContactInfo } from '../../services/contacts';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContacts = useAtomValue(allContactsAtom);

  const conversationRowViews = () => {
    return allContacts.map((contactID: string) => {
      const contactInfo = getContactInfo(contactID);
      if (!contactInfo) {
        console.log(contactID);
        throw new Error('Contact info not found in ConversationsPage');
      }

      return (
        <View style={styles.rowContainer} key={contactID}>
          <ConversationsRow
            navigation={navigation}
            name={contactInfo.nickname}
            contactId={contactInfo.contactID}
          />
        </View>
      );
    });
  };

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Conversations" />
      {conversationRowViews()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: 27,
    marginVertical: 15,
    width: '100%',
    height: 65,
  },
});

export default ConversationsPage;
