import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { fetchMessage } from '../../../services/message_storage';
import { theme, vars } from '../../../utils/theme';
import LastSeenBubble from '../../ui/LastSeenBubble';
import NotificationBubble from '../../ui/NotificationBubble';
import ProfilePicture from '../../ui/ProfilePicture';

type Props = {
  navigation: any;
  name: string;
  contactId: string;
  unreadCount: number;
  lastMessagePointer: string | undefined;
};

const ConversationsRow = ({
  navigation,
  name,
  contactId,
  unreadCount,
  lastMessagePointer,
}: Props) => {
  const lastMessage = lastMessagePointer ? fetchMessage(lastMessagePointer) : undefined;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Chat', { user: contactId })}
    >
      <ProfilePicture size="lg_s" title={name || contactId || ''} />
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>
          {lastMessage ? (
            <Text style={theme.textSmallLight}>{lastMessage.content}</Text>
          ) : (
            <LastSeenBubble user={contactId} largeText={true} />
          )}
        </View>
        {unreadCount > 0 && <NotificationBubble count={unreadCount} />}
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
    paddingLeft: 21,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    marginLeft: 15,
    height: '100%',
  },
  textContainer: {
    flexDirection: 'column',
  },
  nameText: {
    lineHeight: 23,
    marginBottom: 4,
    fontSize: 19,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.darkest,
  },
});

export default ConversationsRow;
