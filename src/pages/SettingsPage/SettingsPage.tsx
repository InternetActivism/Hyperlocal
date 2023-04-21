import Clipboard from '@react-native-clipboard/clipboard';
import { Input as BaseInput } from '@rneui/base';
import { Input, Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { createRef, RefObject, useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsHeader from '../../components/features/Settings/SettingsHeader';
import ChevronRightIcon from '../../components/ui/Icons/ChevronRightIcon';
import CopyIcon from '../../components/ui/Icons/SettingsIcons/CopyIcon';
import ProfilePicture from '../../components/ui/ProfilePicture';
import { currentUserInfoAtom } from '../../services/atoms';
import { CurrentUserInfo } from '../../services/database';
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
  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

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

  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

  const input: RefObject<TextInput & BaseInput> = createRef<TextInput & BaseInput>();

  const copyIDToClipboard = () => {
    Clipboard.setString(currentUserInfo?.userID || '');
  };

  const saveName = () => {
    setIsEditing(false);

    const newUserInfo: CurrentUserInfo = {
      ...currentUserInfo,
      nickname: newName,
      dateUpdated: Date.now(),
    };

    setCurrentUserInfo(newUserInfo);
  };

  useEffect(() => {
    if (isEditing) {
      input.current?.focus();
    }
  }, [isEditing, input]);

  return (
    <View style={styles.pageContainer}>
      <SettingsHeader />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {currentUserInfo?.nickname && (
          <View style={styles.ring}>
            <ProfilePicture
              size="xl"
              title={currentUserInfo?.nickname || currentUserInfo?.userID || ''}
            />
          </View>
        )}
        <Input
          ref={input}
          value={newName}
          style={[theme.textTitle, styles.nameText]}
          editable={isEditing}
          onChangeText={(text) => {
            setNewName(text);
          }}
          textAlign="center"
          inputContainerStyle={styles.inputContainer}
          onEndEditing={saveName}
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
          <View style={styles.listGroup}>
            <ListItem
              imageSource={SettingsIcon}
              title="Edit Profile"
              rightView={<View style={styles.forwardButton}>{<ChevronRightIcon />}</View>}
              onPress={() => setIsEditing(true)}
            />
          </View>
          <View style={styles.listGroup}>
            <ListItem
              imageSource={AboutIcon}
              title="About Us"
              rightView={<View style={styles.forwardButton}>{<ChevronRightIcon />}</View>}
              onPress={async () => await Linking.openURL('https://InternetActivism.org')}
            />
            <ListItem
              imageSource={HelpIcon}
              title="Help & Support"
              onPress={async () => await Linking.openURL('https://discord.com/invite/29W2yh2d9s')}
            />
            <ListItem
              imageSource={ReportIcon}
              title="Report a Bug"
              onPress={async () =>
                await Linking.openURL(
                  'https://docs.google.com/forms/d/e/1FAIpQLScWFmUh--oPja-0Nq-wRqaxv5eNejKaSFkntt5Nl7wvl3l39g/viewform?usp=sf_link'
                )
              }
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.listContainer}>
        <View style={[styles.listGroup, styles.bottomGroup]}>
          <ListItem imageSource={LogoutIcon} title="Log Out & Destroy All Data" />
        </View>
      </View>
    </View>
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    pageContainer: {
      backgroundColor: vars.backgroundColor,
      marginBottom: insets.top + insets.bottom,
      marginTop: 20,
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
    nameText: {
      marginTop: 10,
    },
    scrollView: {
      marginTop: 26,
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    scrollViewContent: { alignItems: 'center' },
    ring: {
      borderWidth: 2,
      borderColor: '#424242',
      padding: 3,
      borderRadius: 70,
    },
    listContainer: {
      width: '100%',
      paddingHorizontal: 16,
      flex: 1,
    },
    listGroup: {
      backgroundColor: '#191A19',
      marginTop: 30,
      borderRadius: 10,
    },
    bottomGroup: { position: 'absolute', bottom: 15, width: '100%', marginHorizontal: 16 },
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
    inputContainer: { borderBottomWidth: 0 },
  });

export default ProfilePage;
