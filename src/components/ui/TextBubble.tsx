import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '../../services/database';

interface Props {
  message: Message;
}

const TextBubble = ({ message }: Props) => {
  const styles = getStyles(message.isReciever);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.text}</Text>
      </View>
    </View>
  );
};

const getStyles = (isReciever: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingBottom: 15,
      backgroundColor: '#fff',
      paddingHorizontal: 15,
    },
    bubble: {
      maxWidth: 300,
      backgroundColor: isReciever ? '#EFEEF4' : '#0196FD',
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

export default TextBubble;
