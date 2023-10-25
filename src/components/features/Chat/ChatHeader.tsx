import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../../App';
import {
  activeConnectionsAtom,
  allContactsAtom,
  connectionInfoAtomInterface,
  contactInfoAtom,
} from '../../../services/atoms';
import { getConnectionName } from '../../../services/connections';
import { theme, vars } from '../../../utils/theme';
import AlertBubble from '../../ui/AlertBubble';
import ChevronRightIcon from '../../ui/Icons/ChevronRightIcon';
import ProfilePicture from '../../ui/ProfilePicture';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Chat', undefined>;
  contactID: string;
}

const ChatHeader = ({ navigation, contactID }: Props) => {
  const [allContactsInfo] = useAtom(contactInfoAtom);
  const [allContacts] = useAtom(allContactsAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const [connections] = useAtom(activeConnectionsAtom);

  const name = allContacts.includes(contactID)
    ? allContactsInfo[contactID].nickname
    : getConnectionName(contactID, connectionInfo);

  const styles = getStyles(connections.includes(contactID));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.ring}
        onPress={() => navigation.navigate('Profile', { user: contactID })}
      >
        <ProfilePicture size="sm" title={name || contactID || ''} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={theme.textSubHeader}>
          {name}
        </Text>
        <View style={styles.bubble}>
          {
            <AlertBubble
              primary={(connections.includes(contactID) || connections.length !== 0) ?? false}
              text={
                connections.includes(contactID)
                  ? 'Nearby'
                  : connections.length !== 0
                  ? `Send via Mesh: ${connections.length} nearby`
                  : 'No nearby users'
              }
            />
          }
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

const getStyles = (connected: boolean) =>
  StyleSheet.create({
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
    ring: {
      borderWidth: 1.5,
      borderColor: connected ? vars.primaryColor.soft : vars.gray.softest,
      padding: 2,
      borderRadius: 40,
    },
  });

export default ChatHeader;
