import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import LastSeenBubble from '../../ui/LastSeenBubble';
import NotificationBubble from '../../ui/NotificationBubble';
import ProfilePicture from '../../ui/ProfilePicture';

type Props = {
  navigation: any;
  name: string;
  contactId: string;
  unreadCount: number;
};

const ConversationsRow = ({ navigation, name, contactId, unreadCount }: Props) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Chat', { user: contactId })}
    >
      <ProfilePicture size="lg_s" title={name || contactId || ''} />
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>
          <LastSeenBubble user={contactId} largeText={true} />
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
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  textContainer: {
    flexDirection: 'column',
  },
  nameText: {
    lineHeight: 23,
    marginBottom: 6,
    fontSize: 19,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.darkest,
  },
});

export default ConversationsRow;
