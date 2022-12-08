import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NearbyAvatar } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map((bridgefyID, i) => {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { user: bridgefyID })}>
            <NearbyAvatar key={i} name={bridgefyID} />
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
