import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { DefaultHeader, ConversationsRow } from '../../components';
import { getAllConversations, Message } from '../../services/database';

const ConversationsPage = ({ navigation }) => {
  const allConversations = getAllConversations();

  const conversationRowViews = () => {
    return allConversations.map(conversation => {
      return (
        <View>
          <View style={styles.rowContainer} key={conversation.id}>
            <ConversationsRow name={conversation.id} />
          </View>
          {conversation.messages.map((message: Message) => {
            return <Text key={message.id}>{message.text}</Text>;
          })}
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
