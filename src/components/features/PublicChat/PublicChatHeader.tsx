import { Avatar, Button, Text } from '@rneui/themed';
import AlertBubble from 'components/ui/AlertBubble';
import ChevronLeftIcon from 'components/ui/Icons/ChevronLeftIcon';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from 'utils/theme';

interface Props {
  navigation: any; // TODO: figure out what type this is
  numConnected: number;
}

const PublicChatHeader = ({ navigation, numConnected }: Props) => {
  return (
    <View style={styles.container}>
      <Button
        icon={<ChevronLeftIcon />}
        buttonStyle={styles.backButton}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={theme.textSubHeader}>
          Public Chat
        </Text>
        <View style={styles.bubble}>
          <AlertBubble
            primary={numConnected > 0}
            text={`${numConnected ? numConnected : 'None'} nearby`}
          />
        </View>
      </View>
      <Avatar
        containerStyle={[
          {
            width: 38,
            height: 38,
            borderRadius: 19,
          },
          { backgroundColor: vars.backgroundColor },
        ]}
        titleStyle={{
          fontSize: 20,
          fontFamily: 'Helvetica',
        }}
        title={''}
      />
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

export default PublicChatHeader;
