import Clipboard from '@react-native-clipboard/clipboard';
import { StackScreenProps } from '@react-navigation/stack';
import { Text } from '@rneui/base';
import { useAtom } from 'jotai';
import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../App';
import ListItem from '../components/common/ListItem';
import StackHeader from '../components/common/StackHeader';
import CopyIcon from '../components/ui/Icons/SettingsIcons/CopyIcon';
import ProfilePicture from '../components/ui/ProfilePicture';
import { contactInfoAtom } from '../services/atoms';
import { theme, vars } from '../utils/theme';

type NavigationProps = StackScreenProps<RootStackParamList, 'Profile'>;

const ProfilePage = ({ route, navigation }: NavigationProps) => {
  const { user: contactID } = route.params;
  const [allContactsInfo, setAllContactsInfo] = useAtom(contactInfoAtom);

  const ExclamationIcon = require('../components/ui/Icons/SettingsIcons/exclamation.png');

  const contactInfo = allContactsInfo[contactID];

  const copyIDToClipboard = () => {
    Clipboard.setString(contactInfo?.contactID || '');
  };

  const toggleBlocked = () => {
    setAllContactsInfo((prev) => {
      prev[contactID] = {
        ...prev[contactID],
        contactID: contactID,
        nickname: contactInfo.nickname,
        contactFlags: 0, // used in future versions
        verified: false, // used in future versions
        blocked: !contactInfo.blocked,
        lastSeen: Date.now(),
        dateCreated: Date.now(),
        unreadCount: 0,
      };
      return { ...prev };
    });
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Profile" backOnRight />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {contactInfo?.nickname && (
          <View style={styles.ring}>
            <ProfilePicture
              size="xl"
              title={contactInfo?.nickname || contactInfo?.contactID || ''}
            />
          </View>
        )}
        <Text
          style={[theme.textTitle, styles.nameText]}
          inputContainerStyle={styles.inputContainer}
        >
          {contactInfo?.nickname}
        </Text>
        <View style={styles.uuidContainer}>
          <Text style={styles.uuidText} numberOfLines={1}>
            {'ID: ' + contactInfo?.contactID}
          </Text>
          <TouchableOpacity onPress={copyIDToClipboard}>
            <CopyIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.listGroup}>
            <ListItem
              imageSource={ExclamationIcon}
              title={`${contactInfo.blocked ? 'Unblock' : 'Block'} ${contactInfo?.nickname}`}
              onPress={toggleBlocked}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: vars.backgroundColor,
    // marginBottom: insets.top + insets.bottom,
    // marginTop: 20,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: vars.backgroundColor,
  },
  pill: {
    width: 35,
    height: 5,
    backgroundColor: vars.gray.dark,
  },
  uuidContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
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
