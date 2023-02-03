import { Text } from '@rneui/themed';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../utils/theme';
import { LastSeenBubble, ProfilePicture } from '../../ui';

type Props = {
  navigation: any;
  name: string;
  contactId: string;
};

const ConversationsRow = ({ navigation, name, contactId }: Props) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Chat', { user: contactId })}
    >
      <ProfilePicture size="md" title={name} />
      <View style={styles.textContainer}>
        <Text style={[theme.textSubHeader, styles.nameText]}>{name}</Text>
        <LastSeenBubble user={contactId} />
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
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 15,
  },
  nameText: {
    lineHeight: 23,
    marginBottom: 5,
  },
  lastSeenText: {},
});

export default ConversationsRow;
