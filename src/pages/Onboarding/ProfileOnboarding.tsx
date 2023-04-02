import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { createRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import TitleInput from '../../components/ui/TitleInput';
import { currentUserInfoAtom } from '../../services/atoms';
import { CurrentUserInfo } from '../../services/database';
import { theme, vars } from '../../utils/theme';
import { OnboardingStackParamList } from './OnboardingNavigator';

export default function ProfileOnboarding() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [nameText, setNameText] = useState<string>(currentUserInfo?.nickname || '');
  const input = createRef<TextInput>();

  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'ProfileOnboarding'>>();

  function updateNickname(newName: string) {
    if (!currentUserInfo) {
      throw new Error('No user info found.');
    }

    const newUserInfo: CurrentUserInfo = {
      ...currentUserInfo,
      nickname: newName,
      dateUpdated: Date.now(),
    };
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
            placeholder={'Johnny Appleseed'}
            onChangeText={(value: string) => {
              setNameText(value);
            }}
            defaultValue={nameText}
          />
        </View>
        <Text style={[theme.textBodyLight, styles.subscript]}>
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
            navigation.navigate('Bluetooth');
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
  },
  subscript: {
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
