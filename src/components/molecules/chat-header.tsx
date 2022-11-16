import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfilePictureSmall } from '../atoms';

const ChatHeader = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="<"
        buttonStyle={styles.backButton}
        onPress={() => navigation.popToTop()}
      />
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>John Doe</Text>
        <Text style={styles.lastSeenText}>Last seen 2 hours ago</Text>
      </View>
      <ProfilePictureSmall />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    paddingHorizontal: 20,
    top: 0,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    height: 37,
    width: 37,
    borderRadius: 18.5,
    backgroundColor: '#d3d3d3',
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
  },
  lastSeenText: {
    fontSize: 12,
    fontFamily: 'Rubik-Medium',
  },
});

export default ChatHeader;
