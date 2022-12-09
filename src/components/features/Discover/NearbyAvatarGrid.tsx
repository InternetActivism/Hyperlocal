import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NearbyAvatar } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getContactInfo } from '../../../services/contacts';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map((connectionID, i) => {
        let name = connectionID;

        // check if contact info exists, if so, use name
        const contactInfo = getContactInfo(connectionID);
        if (contactInfo) {
          name = contactInfo.name;
        }

        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { user: connectionID })}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  extraAvatar: {
    opacity: 0,
  },
});

export default NearbyAvatarGrid;
