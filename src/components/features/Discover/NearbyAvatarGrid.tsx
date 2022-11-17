import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NearbyAvatar } from '../../../components';

const NearbyAvatarGrid = ({ connections }: { connections: Array<string> }) => {
  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {connections.map(person => {
        return <NearbyAvatar key={person} name={person} />;
      })}
      {/* TODO: figure out a better solution to this */}
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
