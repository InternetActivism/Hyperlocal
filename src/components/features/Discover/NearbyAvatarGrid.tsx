import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NearbyAvatar } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getContactInfo, isContact } from '../../../services/database/contacts';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // console log to see if connections are being passed in
  console.log('(NearbyAvatarGrid) Connections', connections);

  const createChat = (connectionID: string) => {
    console.log('(NearbyAvatarGrid) Create Chat', connectionID);
    navigation.navigate('Chat', { user: connectionID });
  };

  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map((connectionID, i) => {
        let name = connectionID;

        // check if contact info exists, if so, use name
        if (isContact(connectionID)) {
          const contactInfo = getContactInfo(connectionID);
          if (contactInfo.nickname !== '') {
            name = contactInfo.nickname;
          }
        }

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
