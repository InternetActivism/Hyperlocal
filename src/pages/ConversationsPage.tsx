import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DefaultHeader from '../components/common/DefaultHeader';
import ConversationsRow from '../components/features/Chat/ConversationsRow';
import { contactInfoAtom } from '../services/atoms';

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const [allContactsInfo] = useAtom(contactInfoAtom);

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Conversations" />
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
