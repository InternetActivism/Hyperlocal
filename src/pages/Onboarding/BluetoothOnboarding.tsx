import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React from 'react';
import { KeyboardAvoidingView, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StackHeader } from '../../components';
import { currentUserInfoAtom } from '../../services/atoms';
import { CurrentUserInfo } from '../../services/database';
import { setUserInfoDatabase } from '../../services/user';
import { theme, vars } from '../../utils/theme';

export default function BluetoothOnboarding() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  function updateNickname(newName: string) {
    if (!currentUserInfo) {
      throw new Error('No user info found.');
    }

    const newUserInfo: CurrentUserInfo = {
      ...currentUserInfo,
      nickname: newName,
      dateUpdated: Date.now(),
    };
    // Update the user info in the database.
    setUserInfoDatabase(newUserInfo);
    // Update the user info in the temporary atom state.
    setCurrentUserInfo(newUserInfo);
  }
  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.headerContainer}>
        <StackHeader title="Bluetooth" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[theme.textSectionHeaderLarge, styles.title]}>
          To use the app, you'll need Bluetooth enabled.
        </Text>
        <Text style={styles.subscript}>
          Interested in how Bluetooth messaging works?{' '}
          <Text
            style={styles.subscriptLink}
            onPress={() => Linking.openURL('https://internetactivism.org')}
          >
            Learn More
          </Text>
        </Text>
      </View>
      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        <Button title="Done!" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: vars.backgroundColorSecondary,
  },
  contentContainer: {
    marginTop: '10%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  title: {
    textAlign: 'center',
  },
  subscript: {
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
  },
  subscriptLink: {
    fontFamily: vars.fontFamilyPrimary,
    color: vars.gray.softest,
    fontSize: vars.fontSizeBodyLarge,
    fontWeight: vars.fontWeightRegular,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    paddingBottom: 20,
    alignSelf: 'center',
  },
});
