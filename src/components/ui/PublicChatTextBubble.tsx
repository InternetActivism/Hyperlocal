import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StoredPublicChatMessage } from '../../services/database';
import { MessageStatus } from '../../utils/globals';
import { theme, vars } from '../../utils/theme';

interface Props {
  message: StoredPublicChatMessage;
  callback?: () => void;
}

const PublicChatTextBubble = ({ message, callback }: Props) => {
  let messageStyle;
  let textStyle;

  if (message.isReceiver) {
    messageStyle = styles.receivedBubble;
    textStyle = styles.receivedText;
  } else {
    textStyle = styles.sentText;
    if (message.statusFlag === MessageStatus.FAILED) {
      messageStyle = styles.failedBubble;
    } else if (message.statusFlag === MessageStatus.PENDING) {
      messageStyle = styles.pendingBubble;
    } else {
      messageStyle = styles.sentBubble;
    }
  }

  return (
    <View style={styles.container}>
      <View style={textStyle}>
        <Text style={[styles.name, theme.textBody]}>{message.nickname}</Text>
      </View>
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
  receivedText: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
  },
  sentText: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    display: 'none',
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
  name: {
    paddingHorizontal: 3,
    paddingVertical: 4,
    flexWrap: 'wrap',
    color: vars.gray.soft,
  },
});

export default PublicChatTextBubble;
