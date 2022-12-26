import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertBubble, LastSeenBubble, ProfilePicture } from '../../../components';
import { theme, vars } from '../../../utils/theme';
import ChevronLeftIcon from '../../ui/Icons/ChevronLeftIcon';

interface Props {
  navigation: any; // TODO: figure out what type this is
  contactID: string;
  isContact: boolean;
  name: string;
}

const ChatHeader = ({ navigation, contactID, name, isContact }: Props) => {
  return (
    <View style={styles.container}>
      <Button
        icon={<ChevronLeftIcon />}
        buttonStyle={styles.backButton}
        onPress={() => navigation.popToTop()}
      />
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={theme.textSubHeader}>
          {name}
        </Text>
        <View style={styles.bubble}>
          {isContact ? (
            <LastSeenBubble user={contactID} />
          ) : (
            <AlertBubble primary={false} text="Requested chat." />
          )}
        </View>
      </View>
      <ProfilePicture size="sm" title={contactID} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 70,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: vars.backgroundColorSecondary,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bubble: {
    marginTop: 2,
  },
  backButton: {
    height: 37,
    width: 37,
    borderRadius: 18.5,
    backgroundColor: vars.backgroundColor,
  },
});

export default ChatHeader;
