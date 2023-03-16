import Clipboard from '@react-native-clipboard/clipboard';
import { Input } from '@rneui/base';
import { Text } from '@rneui/themed';
import StackHeader from 'components/common/StackHeader';
import Button from 'components/ui/Button';
import ProfilePicture from 'components/ui/ProfilePicture';
import { useAtom } from 'jotai';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { currentUserInfoAtom } from 'services/atoms';
import { CurrentUserInfo } from 'services/database';
import { setUserInfoDatabase } from 'services/user';
import { theme } from 'utils/theme';

const ProfilePage = () => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(currentUserInfo?.nickname);

  const inputContainerStyle = {
    borderBottomWidth: isEditing ? 1 : 0,
  };

  const copyIDToClipboard = () => {
    Clipboard.setString(currentUserInfo?.userID?.toString() || '');
  };

  return (
    <SafeAreaView>
      <StackHeader title="Profile" />
      <View style={styles.profileContainer}>
        {currentUserInfo?.nickname && (
          <ProfilePicture
            size="xl"
            title={currentUserInfo?.nickname}
            id={currentUserInfo?.userID}
          />
        )}
        <Input
          value={newName}
          style={[theme.textTitle, styles.nameText]}
          editable={isEditing}
          onChangeText={(text) => {
            setNewName(text);
          }}
          textAlign="center"
          inputContainerStyle={inputContainerStyle}
        />
        <TouchableOpacity style={styles.copyContainer} onPress={copyIDToClipboard}>
          <Text style={styles.uuidText}>{'UUID: ' + currentUserInfo?.userID}</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Save' : 'Edit'}
            onPress={() => {
              if (isEditing && currentUserInfo && newName) {
                const newUserInfo: CurrentUserInfo = {
                  ...currentUserInfo,
                  nickname: newName,
                  dateUpdated: Date.now(),
                };
                // Update the user info in the database.
                setUserInfoDatabase(newUserInfo);
                // Update the user info in the temporary atom state.
                setCurrentUserInfo(newUserInfo);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
          />
          {/* <Button
            title="Wipe Data"
            onPress={() => {
              wipeDatabase();
            }}
          /> */}
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
  buttonContainer: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
  },
  nameText: {
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
