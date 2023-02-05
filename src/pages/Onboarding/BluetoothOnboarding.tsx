import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Linking, StyleSheet, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StackHeader } from '../../components';
import { currentUserInfoAtom } from '../../services/atoms';
import { theme, vars } from '../../utils/theme';

export default function BluetoothOnboarding() {
  const [currentUserInfo, setCurrentUserInfo] = useAtom(currentUserInfoAtom);
  const [bluetoothError, setBluetoothError] = React.useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    const getBluetoothPermission = async () => {
      const bluetoothRequest = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
      if (bluetoothRequest === 'granted' && currentUserInfo) {
        setCurrentUserInfo({
          ...currentUserInfo,
          isOnboarded: true,
        });
      } else {
        setBluetoothError(true);
      }
    };
    getBluetoothPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Button
          title="Done!"
          onPress={() => {
            navigation.navigate('Home');
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
