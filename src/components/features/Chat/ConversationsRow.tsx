import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { fetchMessage } from '../../../services/message_storage';
import { theme, vars } from '../../../utils/theme';
import LastSeenBubble from '../../ui/LastSeenBubble';
import ProfilePicture from '../../ui/ProfilePicture';

type Props = {
  navigation: any;
  name: string;
  contactId: string;
  unreadCount: number;
  lastMessagePointer: string | undefined;
  isConnected: boolean;
};

const ConversationsRow = ({
  navigation,
  name,
  contactId,
  unreadCount,
  lastMessagePointer,
  isConnected,
}: Props) => {
  const lastMessage = lastMessagePointer ? fetchMessage(lastMessagePointer) : undefined;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Chat', { user: contactId })}
    >
      <View style={styles.notificationSection}>
        {unreadCount > 0 && <View style={styles.notificationBubble} />}
      </View>
      <ProfilePicture size="lg_s" title={name || contactId || ''} />
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>
          {lastMessage ? (
            <Text numberOfLines={1} style={[theme.textSmallLight, styles.messagePreview]}>
              {lastMessage.content}
            </Text>
          ) : (
            <LastSeenBubble user={contactId} largeText={true} />
          )}
        </View>
        <View style={styles.lastSeen}>
          <LastSeenBubble user={contactId} largeText={true} shorten={true} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 65,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    marginLeft: 8,
    height: '100%',
  },
  textContainer: {
    flexDirection: 'column',
  },
  nameText: {
    lineHeight: 23,
    marginTop: 4,
    marginBottom: 6,
    fontSize: 19,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.darkest,
  },
  messagePreview: {
    color: '#9A9A9A',
    fontSize: 16,
    marginRight: 20,
  },
  lastSeen: {
    position: 'absolute',
    right: 15,
    top: 8,
    fontSize: 15,
    color: vars.gray.sharp,
  },
  notificationBubble: {
    height: 10,
    width: 10,
    borderRadius: 9999,
    backgroundColor: vars.green.sharp,
    position: 'absolute',
    top: '50%',
    left: 0,
  },
  notificationSection: {
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConversationsRow;
