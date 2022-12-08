import { useAtomValue } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ConversationsRow } from '../../components';
import { allUsersAtom } from '../../services/atoms';

// interface Props {
//   navigation: NavigationProp;
//   allConvos: string[];
// }'

const ConversationsPage = ({ navigation }: { navigation: any }) => {
  const allUsers = useAtomValue(allUsersAtom);

  const conversationRowViews = () => {
    return allUsers.map((convo: string) => {
      return (
        <View style={styles.rowContainer} key={convo}>
          <ConversationsRow navigation={navigation} name={convo} />
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
