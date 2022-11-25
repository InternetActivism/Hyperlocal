import { Button, Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfilePicture } from '../../../components';
import { connectionsAtom } from '../../../services/atoms';
import { getLastSeenTime } from '../../../services/database';

interface Props {
  navigation: any; // TODO: figure out what type this is
  user: string;
}

const ChatHeader = ({ navigation, user }: Props) => {
  const connections = useAtomValue(connectionsAtom);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    setIsConnected(connections.includes(user));
  }, [connections]);

  const lastOnline: string = getLastSeenTime(user);

  const styles = getStyles(isConnected);
  return (
    <View style={styles.container}>
      <Button
        title="<"
        buttonStyle={styles.backButton}
        onPress={() => navigation.popToTop()}
      />
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.nameText}>
          {user}
        </Text>
        <Text style={styles.lastSeenText}>
          {isConnected ? 'Connected' : 'Nearby ' + lastOnline}
        </Text>
      </View>
      <ProfilePicture size="sm" />
    </View>
  );
};

const getStyles = (isConnected: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: 50,
      paddingHorizontal: 20,
      top: 0,
      marginBottom: 10,
    },
    textContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
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
      color: isConnected ? '#0196FD' : '#000000',
    },
  });

export default ChatHeader;
