import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ProfilePicture } from '../../components';
import ProfileHeader from '../../components/features/Profile/ProfileHeader';
import { Button } from '@rneui/base';

const ProfilePage = () => {
  return (
    <SafeAreaView>
      <ProfileHeader />
      <View style={styles.profileContainer}>
        <ProfilePicture size="xl" />
        <Text style={styles.nameText}>Adrian Adragna</Text>
        <Text style={styles.uuidText}>UUID: 1234567890</Text>
        <View style={styles.buttonContainer}>
          <Button buttonStyle={styles.buttonStyle}>Edit Profile</Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  uuidText: {
    fontSize: 20.8,
    fontFamily: 'Helvetica',
    fontWeight: '700',
    color: '#8A8A8A',
    marginTop: 10,
  },
  buttonStyle: {
    background: '#0196FD',
    borderRadius: 32,
    width: 286,
    height: 49,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
  },
  nameText: {
    fontFamily: 'Helvetica',
    fontSize: 22.81,
    fontWeight: '700',
    marginTop: 15,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 26,
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  subHeader: {
    fontSize: 23,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
});

export default ProfilePage;
