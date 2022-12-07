import { Text } from '@rneui/themed';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ProfilePicture } from '../../components';
import ProfileHeader from '../../components/features/Profile/ProfileHeader';
import { Button, Input } from '@rneui/base';
import { useAtom } from 'jotai';
import { currentUserInfoAtom } from '../../services/atoms';
import { setCurrentUser } from '../../services/database';

const ProfilePage = () => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(currentUserInfo?.name);

  const inputContainerStyle = {
    borderBottomWidth: isEditing ? 1 : 0,
  };

  const copyIDToClipboard = () => {
    Clipboard.setString(currentUserInfo?.bridgefyID.toString() || '');
  };

  return (
    <SafeAreaView>
      <ProfileHeader />
      <View style={styles.profileContainer}>
        {currentUserInfo?.name && (
          <ProfilePicture size="xl" title={currentUserInfo?.name} />
        )}
        <Input
          value={newName}
          style={styles.nameText}
          editable={isEditing}
          onChangeText={text => {
            setNewName(text);
          }}
          textAlign="center"
          inputContainerStyle={inputContainerStyle}
        />
        <TouchableOpacity
          style={styles.copyContainer}
          onPress={copyIDToClipboard}>
          <Text style={styles.uuidText}>
            {'UUID: ' + currentUserInfo?.bridgefyID}
          </Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={styles.buttonStyle}
            onPress={() => {
              if (isEditing && currentUserInfo && newName) {
                const newUserInfo = {
                  bridgefyID: currentUserInfo.bridgefyID,
                  name: newName,
                  dateCreated: currentUserInfo.dateCreated,
                };
                setCurrentUser(newUserInfo);
                setCurrentUserInfo(newUserInfo);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Button>
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
  copyContainer: {
    maxWidth: '80%',
    borderWidth: 1,
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    borderColor: '#8A8A8A',
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
