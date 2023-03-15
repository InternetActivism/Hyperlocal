import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import LastSeenBubble from '../../ui/LastSeenBubble';
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
      <ProfilePicture size="md" title={name} id={contactId} />
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>
          <LastSeenBubble user={contactId} />
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBubble}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
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
    marginBottom: 5,
  },
  unreadBubble: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: vars.green.sharp,
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 20,
    fontWeight: vars.fontWeightBold,
    color: vars.black.sharp,
    textAlign: 'center',
  },
});

export default ConversationsRow;
