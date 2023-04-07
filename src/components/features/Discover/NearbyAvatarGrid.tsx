import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  allContactsAtom,
  connectionInfoAtomInterface,
  contactInfoAtom,
} from '../../../services/atoms';
import { getConnectionName } from '../../../services/connections';
import NearbyAvatar from './NearbyAvatar';

interface Props {
  connections: string[];
  handleNewChat: (connectionID: string) => void;
}

const NearbyAvatarGrid = ({ connections, handleNewChat }: Props) => {
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const contactInfo = useAtomValue(contactInfoAtom);
  const contacts = useAtomValue(allContactsAtom);
  const navigation = useNavigation<StackNavigationProp<any>>();

  const createChat = (connectionID: string) => {
    console.log('(NearbyAvatarGrid) Create Chat', connectionID);

    // If the connection is a contact, go to the chat page, since the chat invitation has already been accepted.
    if (contacts.includes(connectionID)) {
      console.log('(NearbyAvatarGrid) Create Chat: user is contact', connectionID);
      navigation.navigate('Chat', { user: connectionID });
    } else {
      handleNewChat(connectionID);
    }
  };

  return (
    <ScrollView horizontal={true} bounces={true} showsHorizontalScrollIndicator={false}>
      <View style={styles.nearbyPeersAvatarContainer}>
        {connections.map((connectionID, i) => {
          const isContact = contacts.includes(connectionID);
          let name = isContact
            ? contactInfo[connectionID]!.nickname
            : getConnectionName(connectionID, connectionInfo);
          return (
            <TouchableOpacity
              onPress={() => createChat(connectionID)}
              style={styles.avatarContainer}
              key={i}
            >
              <NearbyAvatar name={name} id={connectionID} isContact={isContact} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nearbyPeersAvatarContainer: {
    paddingTop: 15,
    paddingBottom: 3,
    flexDirection: 'row',
  },
  avatarContainer: {
    paddingRight: 20,
  },
});

export default NearbyAvatarGrid;
