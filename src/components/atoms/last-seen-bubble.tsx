import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const LastSeenBubble = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.lastSeenText}>Nearby</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E3F5FB',
  },
  lastSeenText: {
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Rubik-Medium',
    color: '#0196FD',
  },
});

export default LastSeenBubble;
