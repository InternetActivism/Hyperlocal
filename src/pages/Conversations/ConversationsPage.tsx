import { NavigationProp } from '@react-navigation/native';
import { Button, Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ConversationsRow } from '../../components';
import { allUsersAtom } from '../../services/atoms';
import { getAllConversations, Message } from '../../services/database';

// interface Props {
//   navigation: NavigationProp;
//   allConvos: string[];
// }

const ConversationsPage = ({ navigation }) => {
  // const allConversations = getAllConversations();
  const allUsers = useAtomValue(allUsersAtom);

  const conversationRowViews = () => {
    return allUsers.map((convo: string) => {
      return (
        <View>
          <View style={styles.rowContainer} key={convo}>
            <ConversationsRow name={convo} />
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView>
      <DefaultHeader pageName="Conversations" />
      {conversationRowViews()}
      <Button title="Go to chat" onPress={() => navigation.navigate('Chat')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: 27,
    marginTop: 25,
    width: '100%',
    height: 65,
  },
});

export default ConversationsPage;
