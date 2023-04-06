import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StoredChatMessage } from '../../services/database';
import { MessageStatus } from '../../utils/globals';
import { theme, vars } from '../../utils/theme';

interface Props {
  message: StoredChatMessage;
  callback?: () => void;
}

const TextBubble = ({ message, callback }: Props) => {
  let messageStyle;

  if (message.isReceiver) {
    messageStyle = styles.receivedBubble;
  } else if (message.statusFlag === MessageStatus.FAILED) {
    messageStyle = styles.failedBubble;
  } else if (message.statusFlag === MessageStatus.PENDING) {
    messageStyle = styles.pendingBubble;
  } else {
    messageStyle = styles.sentBubble;
  }

  return (
    <View style={styles.container}>
      <View style={messageStyle}>
        <Text style={[styles.text, theme.textBody]} onPress={callback}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 15,
    backgroundColor: vars.backgroundColor,
    paddingHorizontal: 10,
  },
  pendingBubble: {
    maxWidth: 300,
    alignSelf: 'flex-end',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.primaryColor.soft,
    borderStyle: 'dashed',
    backgroundColor: vars.primaryColor.darkest,
  },
  failedBubble: {
    maxWidth: 300,
    alignSelf: 'flex-end',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.negativeColor.soft,
    backgroundColor: vars.negativeColor.darkest,
  },
  receivedBubble: {
    maxWidth: 300,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: vars.gray.dark,
  },
  sentBubble: {
    maxWidth: 300,
    alignSelf: 'flex-end',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    backgroundColor: vars.primaryColor.darker,
  },
  text: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexWrap: 'wrap',
  },
});

export default TextBubble;
