import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NearbyAvatar } from '../../../components';
import { connectionInfoAtomInterface } from '../../../services/atoms';
import { getConnectionName } from '../../../services/connections';
import { getContactInfo, isContact } from '../../../services/contacts';
import { sendChatInvitationWrapper } from '../../../services/transmission';
import { getUserInfoDatabase } from '../../../services/user';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const createChat = (connectionID: string) => {
    console.log('(NearbyAvatarGrid) Create Chat', connectionID);

    // If the connection is a contact, go to the chat page, since the chat invitation has already been accepted.
    if (isContact(connectionID)) {
      navigation.navigate('Chat', { user: connectionID });
    } else {
      // If the connection is not a contact, send a chat invitation and go to the chat page in the meantime.
      // User info should be available, but if not, throw an error. This should never happen, remove once confident.
      const user = getUserInfoDatabase();
      if (!user) {
        throw new Error('User not found and conversation clicked');
      }

      // Send chat invitation message via Bridgefy.
      sendChatInvitationWrapper(connectionID, user.nickname);

      // Go to the chat page which will be updated when the chat invitation is received as accepted.
      // This will change in the future as users will not auto accept chat invitations.
      navigation.navigate('Chat', { user: connectionID });
    }
  };

  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map((connectionID, i) => {
        let name = isContact(connectionID)
          ? getContactInfo(connectionID).nickname
          : getConnectionName(connectionID, connectionInfo);
        return (
          <TouchableOpacity onPress={() => createChat(connectionID)}>
            <NearbyAvatar key={i} name={name} />
          </TouchableOpacity>
        );
      })}
      {/* TODO: figure out a better solution to styling in gridview*/}
      {connections.length % 3 === 2 ? (
        <NearbyAvatar name="extra" style={styles.extraAvatar} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  nearbyPeersAvatarContainer: {
    paddingVertical: 10,
    display: 'flex',
    flex: 3,
    flexWrap: 'wrap',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  extraAvatar: {
    opacity: 0,
  },
});

export default NearbyAvatarGrid;
