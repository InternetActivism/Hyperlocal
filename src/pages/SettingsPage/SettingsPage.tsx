import Clipboard from '@react-native-clipboard/clipboard';
import { Input } from '@rneui/base';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '../../components/features/Settings/SettingsHeader';
import SettingsIcon from '../../components/ui/Icons/HeaderIcons/SettingsIcon';
import AboutIcon from '../../components/ui/Icons/SettingsIcons/AboutIcon';
import CopyIcon from '../../components/ui/Icons/SettingsIcons/CopyIcon';
import ProfilePicture from '../../components/ui/ProfilePicture';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';

const ListItem = ({
  icon,
  title,
  rightView,
}: {
  icon: JSX.Element;
  title: string;
  rightView?: JSX.Element;
}): JSX.Element => {
  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: 17,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={styles.listItemIconContainer}>{icon}</View>
      <Text
        style={{
          fontFamily: vars.fontFamilySecondary,
          fontWeight: vars.fontWeightMedium,
          fontSize: 18,
          color: '#C5C9C5',
        }}
      >
        {title}
      </Text>
    </View>
  );
};

type Props = {
  dismiss: () => void;
};

const ProfilePage = ({ dismiss }: Props) => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(currentUserInfo?.nickname);

  const inputContainerStyle = {
    borderBottomWidth: isEditing ? 1 : 0,
  };

  const copyIDToClipboard = () => {
    Clipboard.setString(currentUserInfo?.userID || '');
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      <SettingsHeader />
      <View style={styles.profileContainer}>
        {currentUserInfo?.nickname && (
          <View style={styles.ring}>
            <ProfilePicture
              size="xl"
              title={currentUserInfo?.nickname || currentUserInfo?.userID || ''}
            />
          </View>
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
        <View style={styles.uuidContainer}>
          <Text style={styles.uuidText} numberOfLines={1}>
            {'ID: ' + currentUserInfo?.userID}
          </Text>
          <TouchableOpacity onPress={copyIDToClipboard}>
            <CopyIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.listGroupWithGap}>
            <ListItem icon={<SettingsIcon height={25} width={25} />} title="Edit Profile" />
          </View>
          <View style={styles.listGroupWithGap}>
            <ListItem icon={<SettingsIcon height={25} width={25} />} title="Public Chat Notifications" />
          </View>
          <View style={styles.listGroup}>
            <ListItem icon={<SettingsIcon height={25} width={25} />} title="Set an App Password" />
          </View>
          <View style={styles.listGroupWithGap}>
            <ListItem icon={<AboutIcon height={25} width={25} />} title="About Us" />
          </View>
          <View style={styles.listGroup}>
            <ListItem icon={<SettingsIcon height={25} width={25} />} title="Help & Support" />
          </View>
          <View style={styles.listGroup}>
            <ListItem icon={<SettingsIcon height={25} width={25} />} title="Report a Bug" />
          </View>
        </View>
        {/* <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Save' : 'Edit'}
            onPress={() => {
              if (isEditing && currentUserInfo && newName) {
                const newUserInfo: CurrentUserInfo = {
                  ...currentUserInfo,
                  nickname: newName,
                  dateUpdated: Date.now(),
                };
                setCurrentUserInfo(newUserInfo);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
          />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: vars.backgroundColor,
  },
  uuidContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  uuidText: {
    fontSize: 20.8,
    fontFamily: 'Helvetica',
    fontWeight: '700',
    color: '#8A8A8A',
    width: '50%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
  },
  nameText: {
    marginTop: 10,
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
  ring: {
    borderWidth: 2,
    borderColor: '#424242',
    padding: 3,
    borderRadius: 70,
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  listGroup: {
    backgroundColor: '#191A19',
    borderRadius: 10,
  },
  listGroupWithGap: {
    backgroundColor: '#191A19',
    borderRadius: 10,
    marginTop: 30,
  },
  listItemIconContainer: {
    backgroundColor: '#454D45',
    height: 30,
    width: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7.75,
    marginRight: 20,
  },
});

export default ProfilePage;
