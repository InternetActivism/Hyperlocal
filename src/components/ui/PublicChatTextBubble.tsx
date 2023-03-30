import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StoredPublicChatMessage } from '../../services/database';
import { MessageStatus } from '../../utils/globals';
import { theme, vars } from '../../utils/theme';
import PublicChatContactIcon from './Icons/PublicChatContactIcon';

interface Props {
  message: StoredPublicChatMessage;
  showName: boolean;
  isContact?: boolean;
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

const PublicChatTextBubble = ({ message, isContact, showName, callback }: Props) => {
  if (message.isReceiver) {
    return (
      <View style={styles.container}>
        {showName && (
          <View style={styles.titleContainer}>
            <Text style={[theme.textBody, styles.name]}>{message.nickname}</Text>
            {isContact && <PublicChatContactIcon />}
          </View>
        )}
        <View style={[styles.messageContainer, styles.receivedBubble]}>
          <Text style={[styles.textSpacing, styles.receivedText]} onPress={callback}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

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
      <View style={[styles.messageContainer, messageStyle]}>
        <Text style={[styles.textSpacing, styles.sentText]} onPress={callback}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingBottom: 10,
    backgroundColor: vars.backgroundColor,
    paddingHorizontal: 10,
  },
  messageContainer: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    maxWidth: 300,
  },
  pendingBubble: {
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.primaryColor.soft,
    borderStyle: 'dashed',
    backgroundColor: vars.primaryColor.darkest,
  },
  failedBubble: {
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: vars.negativeColor.soft,
    backgroundColor: vars.negativeColor.darkest,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 8,
    backgroundColor: vars.gray.message,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    backgroundColor: vars.primaryColor.message,
  },
  textSpacing: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  sentText: {
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeSmall,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.darkest2,
  },
  receivedText: {
    fontFamily: vars.fontFamilySecondary,
    fontSize: vars.fontSizeSmall,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.greenish,
  },
  name: {
    paddingLeft: 3,
    paddingRight: 5,
    paddingVertical: 4,
    flexWrap: 'wrap',
    color: vars.gray.soft,
  },
});

export default PublicChatTextBubble;
