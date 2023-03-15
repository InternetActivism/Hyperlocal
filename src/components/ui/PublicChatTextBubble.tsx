import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StoredPublicChatMessage } from '../../services/database';
import { MessageStatus } from '../../utils/globals';
import { theme, vars } from '../../utils/theme';

interface Props {
  message: StoredPublicChatMessage;
  callback?: () => void;
}

type MessageStyle = Pick<
  ViewStyle,
  | 'maxWidth'
  | 'alignSelf'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'borderStyle'
  | 'backgroundColor'
>;

const PublicChatTextBubble = ({ message, callback }: Props) => {
  if (message.isReceiver) {
    return (
      <View style={styles.container}>
        <View style={styles.receivedText}>
          <Text style={[styles.name, theme.textBody]}>{message.nickname}</Text>
        </View>
        <View style={styles.receivedBubble}>
          <Text style={[styles.text, theme.textBody]} onPress={callback}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  } else {
    let messageStyle: MessageStyle;
    if (message.statusFlag === MessageStatus.FAILED) {
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
  }
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
