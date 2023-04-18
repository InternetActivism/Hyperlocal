import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { StoredDirectChatMessage } from '../../services/database';
import { MessageStatus, TransmissionMode } from '../../utils/globals';
import { vars } from '../../utils/theme';
import InfoIcon from './Icons/InfoIcon';

interface Props {
  message: StoredDirectChatMessage;
  callback?: () => void;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showDelivered?: boolean;
}

const TextBubble = ({ message, callback, setIsModalVisible, showDelivered }: Props) => {
  let messageStyle = styles.sentBubble as ViewStyle;
  let textStyle = styles.sentText;

  if (message.isReceiver) {
    messageStyle = styles.receivedBubble;
    textStyle = styles.receivedText;
  } else if (message.statusFlag === MessageStatus.FAILED) {
    messageStyle = styles.failedBubble;
  } else if (message.statusFlag === MessageStatus.PENDING) {
    messageStyle = styles.pendingBubble;
  } else if (message.transmissionMode === TransmissionMode.MESH) {
    messageStyle = styles.meshBubble;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.messageContainer, messageStyle]}>
        <Text style={[styles.textSpacing, textStyle]} onPress={callback}>
          {message.content}
        </Text>
      </View>
      {showDelivered && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Delivered</Text>
        </View>
      )}
      {message.transmissionMode === TransmissionMode.MESH &&
        message.statusFlag === MessageStatus.SUCCESS &&
        message.isReceiver === false && (
          <TouchableOpacity style={styles.infoContainer} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.infoText}>Sent via Mesh</Text>
            <InfoIcon />
          </TouchableOpacity>
        )}
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
  meshBubble: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 0,
    backgroundColor: '#071D09',
    borderColor: '#0BB019',
    borderWidth: 1,
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
  infoContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    color: '#E7E7E7',
    fontSize: 12,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightRegular,
    marginRight: 3,
  },
});

export default TextBubble;
