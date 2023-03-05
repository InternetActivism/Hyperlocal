import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { createRef } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StackHeader } from '../../components';
import TitleInput from '../../components/ui/TitleInput';
import { currentUserInfoAtom } from '../../services/atoms';
import { CurrentUserInfo } from '../../services/database';
import { setUserInfoDatabase } from '../../services/user';
import { theme, vars } from '../../utils/theme';

export default function ProfileOnboarding() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [nameText, setNameText] = React.useState<string>(currentUserInfo?.nickname || '');
  const input = createRef();

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
        <StackHeader title="Profile" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={theme.textSectionHeaderLarge}>What's your name?</Text>
        <View style={styles.inputContainer}>
          <TitleInput
            ref={input}
            text={nameText}
            onChangeText={(value: string) => {
              setNameText(value);
            }}
          />
        </View>
        <Text style={[theme.textSmallLight, styles.subscript]}>
          Your name will be visible to other nearby users. Don't worry, you can always change it
          later.
        </Text>
      </View>
      <KeyboardAvoidingView behavior="position" style={styles.buttonContainer}>
        <Button
          title="Looks Good!"
          disabled={!nameText}
          onPress={() => {
            updateNickname(nameText);
            navigation.navigate('Bluetooth Onboarding');
          }}
        />
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
    marginTop: '25%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginTop: 20,
    width: '100%',
    paddingRight: 10,
    paddingLeft: 10,
    height: 41,
  },
  subscript: {
    marginTop: 20,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    paddingBottom: 20,
    alignSelf: 'center',
  },
});