import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connectionInfoAtomInterface } from 'services/atoms';
import { getConnectionName } from 'services/connections';
import { getContactInfo, isContact } from 'services/contacts';
import { sendChatInvitationWrapper } from 'services/transmission';
import { getUserInfoDatabase } from 'services/user';
import NearbyAvatar from './NearbyAvatar';
const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const createChat = (connectionID: string) => {
    console.log('(NearbyAvatarGrid) Create Chat', connectionID);

    // If the connection is a contact, go to the chat page, since the chat invitation has already been accepted.
    if (isContact(connectionID)) {
      console.log('(NearbyAvatarGrid) Create Chat: user is contact (not normal)', connectionID);
      navigation.navigate('Chat', { user: connectionID });
    } else {
      // If the connection is not a contact, send a chat invitation and go to the chat page in the meantime.
      // User info should be available, but if not, throw an error. This should never happen, remove once confident.
      const user = getUserInfoDatabase();
      if (!user.userID) {
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
    <ScrollView
      horizontal={true}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContentContainerStyle}
    >
      <View style={styles.nearbyPeersAvatarContainer}>
        {connections.map((connectionID, i) => {
          let name = isContact(connectionID)
            ? getContactInfo(connectionID).nickname
            : getConnectionName(connectionID, connectionInfo);
          return (
            <TouchableOpacity
              onPress={() => createChat(connectionID)}
              style={styles.avatarContainer}
              key={i}
            >
              <NearbyAvatar name={name} id={connectionID} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nearbyPeersAvatarContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
  },
  avatarContainer: {
    paddingRight: 25,
  },
  scrollViewContentContainerStyle: {
    paddingLeft: 20,
  },
});

export default NearbyAvatarGrid;
