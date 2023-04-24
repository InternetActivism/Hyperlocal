import { useNavigation } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import { useAtomValue } from 'jotai';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { unreadCountAtom } from '../../../services/atoms';
import { vars } from '../../../utils/theme';
import GlobeIcon from '../../ui/Icons/GlobeIcon';
import PublicChatChevronIcon from '../../ui/Icons/PublicChatChevronIcon';
import NotificationBubble from '../../ui/NotificationBubble';
import PublicChatAlertBubble from '../../ui/PublicChatAlertBubble';

const PublicChatButton = ({ connections }: { connections: Array<string> }) => {
  const unreadCountState = useAtomValue(unreadCountAtom);
  const navigation = useNavigation<StackNavigationProp<any>>();

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
                text={connections.length ? connections.length + ' in reach' : 'No nearby users'}
              />
            </View>
          </View>
          <View style={styles.chevronContainer}>
            <PublicChatChevronIcon />
          </View>
          {unreadCountState.publicChatUnreadCount > 0 && (
            <NotificationBubble count={unreadCountState.publicChatUnreadCount} />
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
    marginBottom: 8,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: '#1E1F1E',
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
    fontSize: 19,
    fontWeight: vars.fontWeightRegular,
    color: '#D7D7D7',
  },
  chevronContainer: {
    position: 'absolute',
    right: 20,
  },
});

export default PublicChatButton;
