import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connectionsAtom } from '../../services/atoms';
import { getLastSeenTime } from '../../services/database/contacts';

interface Props {
  user: string;
}

const LastSeenBubble = ({ user }: Props) => {
  const connections = useAtomValue(connectionsAtom);
  const [connected, setConnected] = useState<boolean>(false);

  const lastOnline: string = getLastSeenTime(user);

  useEffect(() => {
    setConnected(connections.includes(user));
  }, [connections]);

  const styles = getStyles(connected);
  return (
    <View style={styles.container}>
      <Text style={styles.lastSeenText}>{connected ? 'Nearby' : 'Nearby ' + lastOnline}</Text>
    </View>
  );
};

const getStyles = (connected: boolean) =>
  StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 22,
      borderRadius: 11,
      backgroundColor: connected ? '#E3F5FB' : '#F6F6F6',
    },
    lastSeenText: {
      paddingHorizontal: 10,
      fontSize: 13,
      fontFamily: 'Rubik-Medium',
      color: connected ? '#0196FD' : '#9199A5',
    },
  });

export default LastSeenBubble;
