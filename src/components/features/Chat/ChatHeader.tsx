import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../../App';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  contactInfoAtom,
} from '../../../services/atoms';
import { establishSecureConnection } from '../../../services/bridgefy-link';
import { getConnectionName } from '../../../services/connections';
import { theme, vars } from '../../../utils/theme';
import AlertBubble from '../../ui/AlertBubble';
import ChevronRightIcon from '../../ui/Icons/ChevronRightIcon';
import LastSeenBubble from '../../ui/LastSeenBubble';
import ProfilePicture from '../../ui/ProfilePicture';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat', undefined>;
  contactID: string;
}

const ChatHeader = ({ navigation, contactID }: Props) => {
  const [allContactsInfo] = useAtom(contactInfoAtom);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const [connecting, setConnecting] = useState(true);

  const name = allContacts.includes(contactID)
    ? allContactsInfo[contactID].nickname
    : getConnectionName(contactID, connectionInfo);

  useEffect(() => {
    if (!allContacts.includes(contactID)) {
      setTimeout(() => setConnecting(false), 3000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <ProfilePicture size="xs" title={name || contactID || ''} />
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={theme.textSubHeader}>
          {name}
        </Text>
        <View style={styles.bubble}>
          {allContacts.includes(contactID) ? (
            <LastSeenBubble user={contactID} />
          ) : connecting ? (
            <AlertBubble primary={false} text="Connecting..." />
          ) : (
            <TouchableOpacity onPress={() => establishSecureConnection(contactID)}>
              <AlertBubble primary={false} text="Connection failed. Retry?" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Button
        icon={<ChevronRightIcon />}
        buttonStyle={styles.backButton}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 70,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: vars.backgroundColorSecondary,
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
  bubble: {
    marginTop: 2,
  },
  backButton: {
    height: 37,
    width: 37,
    borderRadius: 18.5,
    backgroundColor: vars.backgroundColor,
  },
});

export default ChatHeader;
