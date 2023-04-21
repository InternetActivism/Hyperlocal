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

type Props = {
  connections: Array<string>;
  createChat: (connectionID: string) => void;
};

const NearbyAvatarGrid = ({ connections, createChat }: Props) => {
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const contactInfo = useAtomValue(contactInfoAtom);
  const contacts = useAtomValue(allContactsAtom);

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
