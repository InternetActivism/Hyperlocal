import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { getUnreadCountAtom } from '../../../services/atoms';
import { vars } from '../../../utils/theme';
import GlobeIcon from '../../ui/Icons/GlobeIcon';
import PublicChatAlertBubble from '../../ui/PublicChatAlertBubble';

const PublicChatButton = ({ connections }: { connections: Array<string> }) => {
  const [unreadCountState] = useAtom(getUnreadCountAtom);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('PublicChat')}>
      <View style={styles.publicChatContainer}>
        <View style={styles.publicChatBox}>
          <View style={styles.globeIconContainer}>
            <GlobeIcon />
          </View>
          <View>
            <Text style={styles.text}>Public Chat</Text>
            <View style={styles.comingSoonContainer}>
              <PublicChatAlertBubble
                text={connections.length ? connections.length + ' in reach' : 'None nearby'}
              />
            </View>
          </View>
          {unreadCountState.publicChatUnreadCount > 0 && (
            <View style={styles.unreadBubble}>
              <Text style={styles.unreadText}>{unreadCountState.publicChatUnreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nearbyPeersAvatarContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
  },
  avatarContainer: {
    paddingRight: 25,
  },
  scrollViewContentContainerStyle: {
    paddingLeft: 20,
  },
  publicChatContainer: {
    height: 95,
    marginHorizontal: 15,
    marginBottom: 18,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: vars.backgroundColorSecondary,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    alignItems: 'center',
  },
  globeIconContainer: {
    paddingHorizontal: 17,
  },
  comingSoonContainer: {
    marginTop: 6,
  },
  lockIconContainer: {
    position: 'absolute',
    right: 15,
  },
  text: {
    paddingLeft: 2,
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 22,
    fontWeight: vars.fontWeightMedium,
    color: '#D7D7D7',
  },
  unreadBubble: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: vars.green.sharp,
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 20,
    fontWeight: vars.fontWeightSemibold,
    color: vars.black.sharp,
    textAlign: 'center',
  },
});

export default PublicChatButton;
