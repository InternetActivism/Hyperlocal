import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { DefaultHeader, NearbyAvatar } from '../../components';
import { Message } from '../../services/database';

const testPeople = [
  'Krish Shah',
  'Adrian Gri',
  'Anant Something',
  'Avi Schiffman',
  'Avi Schiffman',
];

const DiscoverPage = () => {
  return (
    <SafeAreaView>
      <DefaultHeader pageName="Discover" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.nearbyPeersContainer}>
          <Text style={styles.subHeader}>Nearby Peers</Text>
          <View style={styles.nearbyPeersAvatarContainer}>
            {testPeople.map(person => {
              return <NearbyAvatar name={person} />;
            })}

            {/* TODO: figure out a better solution to this */}
            {testPeople.length % 3 === 2 ? (
              <NearbyAvatar name="extra" style={styles.extraAvatar} />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    height: '100%',
  },
  subHeader: {
    fontSize: 23,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  nearbyPeersContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
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

export default DiscoverPage;
