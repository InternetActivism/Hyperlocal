import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NearbyAvatar } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getContactInfo, isContact } from '../../../services/database/contacts';
import { getUserInfo } from '../../../services/database/user';
import { sendChatInvitationWrapper } from '../../../services/database/database';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const createChat = (connectionID: string) => {
    console.log('(NearbyAvatarGrid) Create Chat', connectionID);
    if (isContact(connectionID)) {
      navigation.navigate('Chat', { user: connectionID });
    } else {
      const user = getUserInfo();
      if (!user) {
        throw new Error('User not found and conversation clicked');
      }

      sendChatInvitationWrapper(connectionID);

      // go to the chat page. will be updated when the chat invitation is received as accepted
      // this will change in the future as users will not auto accept chat invitations
      navigation.navigate('Chat', { user: connectionID });
    }
  };

  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map((connectionID, i) => {
        let name = isContact(connectionID) ? getContactInfo(connectionID).nickname : connectionID;
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
