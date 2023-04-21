import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from '@rneui/base';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import SettingsHeader from '../../components/features/Settings/SettingsHeader';
import ChevronRightIcon from '../../components/ui/Icons/ChevronRightIcon';
import CopyIcon from '../../components/ui/Icons/SettingsIcons/CopyIcon';
import ProfilePicture from '../../components/ui/ProfilePicture';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';

const ReportIcon = require('../../components/ui/Icons/SettingsIcons/report.png');
const LogoutIcon = require('../../components/ui/Icons/SettingsIcons/logout.png');
const HelpIcon = require('../../components/ui/Icons/SettingsIcons/help.png');
const AboutIcon = require('../../components/ui/Icons/SettingsIcons/about.png');
const SettingsIcon = require('../../components/ui/Icons/SettingsIcons/settings.png');

type ListItemProps = {
  imageSource: ImageSourcePropType;
  title: string;
  rightView?: JSX.Element;
  onPress?: () => void;
};

const ListItem = ({ imageSource, title, rightView, onPress }: ListItemProps): JSX.Element => {
  return (
    <TouchableOpacity style={styles.listItemContainer} onPress={onPress}>
      <View style={styles.listItemLeftContainer}>
        <Image source={imageSource} style={styles.listItemIconContainer} />
        <Text style={styles.listItemTitle}>{title}</Text>
      </View>
      {rightView}
    </TouchableOpacity>
  );
};

const ProfilePage = () => {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(currentUserInfo?.nickname);

  const navigation = useNavigation<StackNavigationProp<any>>();

  const inputContainerStyle = {
    borderBottomWidth: isEditing ? 1 : 0,
  };

  const copyIDToClipboard = () => {
    Clipboard.setString(currentUserInfo?.userID || '');
  };

  return (
    <View style={styles.pageContainer}>
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
          <View style={[styles.listGroupWithGap, styles.listGroupTop, styles.listGroupBottom]}>
            <ListItem
              imageSource={SettingsIcon}
              title="Edit Profile"
              rightView={<View style={styles.forwardButton}>{<ChevronRightIcon />}</View>}
            />
          </View>
          <View style={[styles.listGroupWithGap, styles.listGroupTop]}>
            <ListItem
              imageSource={AboutIcon}
              title="About Us"
              rightView={<View style={styles.forwardButton}>{<ChevronRightIcon />}</View>}
            />
          </View>
          <View style={styles.listGroup}>
            <ListItem imageSource={HelpIcon} title="Help & Support" />
          </View>
          <View style={[styles.listGroup, styles.listGroupBottom]}>
            <ListItem imageSource={ReportIcon} title="Report a Bug" />
          </View>
          <View style={[styles.listGroupWithBigGap, styles.listGroupTop, styles.listGroupBottom]}>
            <ListItem
              imageSource={LogoutIcon}
              title="Log Out & Destroy All Data"
              onPress={() => {
                navigation.navigate('DeleteData');
              }}
            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: vars.backgroundColor,
    paddingTop: 20,
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
  profileContainer: {
    alignItems: 'center',
    marginTop: 26,
    position: 'relative',
    height: '100%',
    width: '100%',
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
  },
  listGroupWithGap: {
    backgroundColor: '#191A19',
    marginTop: 30,
  },
  listGroupWithBigGap: {
    backgroundColor: '#191A19',
    marginTop: 150,
  },
  listGroupTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  listGroupBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
  listItemContainer: {
    width: '100%',
    paddingHorizontal: 17,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItemLeftContainer: { flexDirection: 'row', alignItems: 'center' },
  listItemTitle: {
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightMedium,
    fontSize: 18,
    color: '#C5C9C5',
  },
  forwardButton: {
    borderRadius: 7.75,
    marginLeft: 20,
  },
});

export default ProfilePage;
