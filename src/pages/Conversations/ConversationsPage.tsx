import { useAtomValue } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ConversationsRow } from '../../components';
import { allUsersAtom } from '../../services/atoms';
import { getContactInfo } from '../../services/contacts';

// interface Props {
//   navigation: NavigationProp;
//   allConvos: string[];
// }'

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allUsers = useAtomValue(allUsersAtom);

  const conversationRowViews = () => {
    return allUsers.map((contactID: string) => {
      // check if contact info exists, if so, use name
      const contactInfo = getContactInfo(contactID);
      console.log('(ConversationsPage) Contact Info', contactID, contactInfo);
      if (!contactInfo) {
        console.log('ALERT: Contact info not found in ConversationsPage');
        return null;
        // throw new Error('Contact info not found in ConversationsPage');
      }

      return (
        <View style={styles.rowContainer} key={contactID}>
          <ConversationsRow
            navigation={navigation}
            name={contactInfo.name}
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
