import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NearbyAvatar } from '../components';

const TestNearbyAvatarGrid = () => {
  const testConnections = [
    '55507E96-B4A2-404F-8A37-6A3898E3EC2B',
    '93f45b0a-be57-453a-9065-86320dda99db',
  ];
  return (
    <View style={styles.nearbyPeersAvatarContainer}>
      {testConnections.map(person => {
        return <NearbyAvatar key={person} name={person} />;
      })}
      {/* TODO: figure out a better solution to this */}
      {testConnections.length % 3 === 2 ? (
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

export default TestNearbyAvatarGrid;
