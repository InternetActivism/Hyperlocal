import { useAtomValue } from 'jotai';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import ConversationsEmptyHeader from '../components/features/Chat/NoConversationsAlert';
import { contactInfoAtom } from '../services/atoms';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allContactsInfo = useAtomValue(contactInfoAtom);

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Messages" />
      {Object.keys(allContactsInfo).length === 0 && <ConversationsEmptyHeader />}
      <ScrollView style={styles.scrollView}>
        {Object.keys(allContactsInfo).map((contactID: string, index: number) => {
          const contactInfo = allContactsInfo[contactID];

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
