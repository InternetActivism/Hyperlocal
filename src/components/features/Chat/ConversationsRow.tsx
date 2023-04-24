import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StoredDirectChatMessage } from '../../../services/database';
import { fetchMessage } from '../../../services/message_storage';
import { MessageType } from '../../../utils/globals';
import { theme, vars } from '../../../utils/theme';
import LastSeenBubble from '../../ui/LastSeenBubble';
import ProfilePicture from '../../ui/ProfilePicture';

type Props = {
  navigation: any;
  name: string;
  contactId: string;
  unreadCount: number;
  lastMessagePointer: string | undefined;
};

const getLatestTextMessage = (lastMessagePointer: string | undefined) => {
  let lastMessage = lastMessagePointer
    ? (fetchMessage(lastMessagePointer) as StoredDirectChatMessage)
    : undefined;

  while (lastMessage && lastMessage?.typeFlag !== MessageType.TEXT) {
    lastMessagePointer = lastMessage.prevMsgPointer;
    if (lastMessagePointer) {
      lastMessage = fetchMessage(lastMessagePointer) as StoredDirectChatMessage;
    }
  }

  return lastMessage;
};

const ConversationsRow = ({
  navigation,
  name,
  contactId,
  unreadCount,
  lastMessagePointer,
}: Props) => {
  const lastMessage = getLatestTextMessage(lastMessagePointer);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Chat', { user: contactId })}
    >
      <View style={styles.notificationSection}>
        {unreadCount > 0 && <View style={styles.notificationBubble} />}
      </View>
      <ProfilePicture size="md" title={name || contactId || ''} />
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>

          <LastSeenBubble
            user={contactId}
            largeText={true}
            shorten={true}
            height={25}
            noBorder={true}
          />
        </View>
        <Text numberOfLines={1} style={[theme.textSmallLight, styles.messagePreview]}>
          {lastMessage ? lastMessage.content : `Say hi to ${name}!`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 65,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
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
  notificationBubble: {
    height: 10,
    width: 10,
    borderRadius: 9999,
    backgroundColor: vars.green.sharp,
    position: 'absolute',
    marginVertical: 'auto',
    left: -2,
  },
  notificationSection: {
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConversationsRow;
