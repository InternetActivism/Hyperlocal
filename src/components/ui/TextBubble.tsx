import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StoredChatMessage } from '../../services/database';
import { MessageStatus } from '../../utils/globals';
import { vars } from '../../utils/theme';

interface Props {
  message: StoredChatMessage;
  callback?: () => void;
}

const TextBubble = ({ message, callback }: Props) => {
  let messageStyle = styles.sentBubble as ViewStyle;
  let textStyle = styles.sentText;

  if (message.isReceiver) {
    messageStyle = styles.receivedBubble;
    textStyle = styles.receivedText;
  } else if (message.statusFlag === MessageStatus.FAILED) {
    messageStyle = styles.failedBubble;
  } else if (message.statusFlag === MessageStatus.PENDING) {
    messageStyle = styles.pendingBubble;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.messageContainer, messageStyle]}>
        <Text style={[styles.textSpacing, textStyle]} onPress={callback}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 10,
    backgroundColor: vars.backgroundColor,
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    maxWidth: 300,
  },
  textSpacing: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  pendingBubble: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.primaryColor.soft,
    borderStyle: 'dashed',
    backgroundColor: vars.primaryColor.darkest,
  },
  failedBubble: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.negativeColor.soft,
    backgroundColor: vars.negativeColor.darkest,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 8,
    backgroundColor: vars.gray.message,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 0,
    backgroundColor: vars.primaryColor.message,
  },
  sentText: {
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeDefault,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.darkest2,
  },
  receivedText: {
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeDefault,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.greenish,
  },
});

export default TextBubble;
