import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '../../services/database';

interface Props {
  message: Message;
  callback?: () => void;
}

const TextBubble = ({ message, callback }: Props) => {
  const styles = getStyles(message.isReciever, message.flags);

  if (callback) {
    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Text style={styles.text} onPress={callback}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.text}</Text>
      </View>
    </View>
  );
};

const getStyles = (isReciever: boolean, flags: number) => {
  let bubbleColor;
  if (isReciever) {
    bubbleColor = '#EFEEF4';
  } else {
    // failed to send message
    if (flags === 2) {
      bubbleColor = '#F40909';
    } else if (flags === 4) {
      bubbleColor = '#EFEEF4';
    } else {
      bubbleColor = '#0196FD';
    }
  }
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingBottom: 15,
      backgroundColor: '#fff',
      paddingHorizontal: 15,
    },
    bubble: {
      maxWidth: 300,
      backgroundColor: bubbleColor,
      borderRadius: 16,
      alignSelf: isReciever ? 'flex-start' : 'flex-end',
    },
    text: {
      fontSize: 17,
      fontFamily: 'Rubik-Regular',
      paddingHorizontal: 13,
      paddingVertical: 9,
      flexWrap: 'wrap',
      color: isReciever ? '#000' : '#fff',
    },
  });
};

export default TextBubble;
