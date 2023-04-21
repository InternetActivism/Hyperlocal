import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/base';
import { Input } from '@rneui/themed';
import { useAtom, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import StackHeader from '../../components/common/StackHeader';
import Button from '../../components/ui/Button';
import { bridgefyStatusAtom, resetAllDataAtom } from '../../services/atoms';
import { destroySession } from '../../services/bridgefy-link';
import { BridgefyStates } from '../../utils/globals';
import { vars } from '../../utils/theme';

const DeleteDataPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [bridgefyStatus, setBridgefyStatus] = useAtom(bridgefyStatusAtom);
  const resetAllData = useSetAtom(resetAllDataAtom);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const styles = getStyles(insets);

  useEffect(() => {
    if (bridgefyStatus === BridgefyStates.DESTROYED) {
      navigation.navigate('Loading');
      resetAllData();
    } else if (bridgefyStatus === BridgefyStates.FAILED_TO_DESTROY) {
      setShowError(true);
    }
  }, [bridgefyStatus, resetAllData, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <StackHeader title="Log Out" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Destroy All Data</Text>
        <Text style={styles.subtitle}>
          {'To delete your account, type \nthe word DELETE in all caps.'}
        </Text>
        <Input
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputTextContainer}
          selectionColor="#FF3737"
          placeholder="DELETE"
          placeholderTextColor={vars.gray.softest}
          renderErrorMessage={false}
          onChangeText={(text) => setInputValue(text)}
        />
        {inputValue === 'DELETE' && (
          <View style={styles.warningBubble}>
            <Text style={styles.warningText}>Warning, this is irreversible!</Text>
          </View>
        )}
      </View>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={'height'}>
        <View style={styles.buttonContainer}>
          <Button
            title="Delete Account & All Data"
            disabled={inputValue !== 'DELETE'}
            styles={{ button: { backgroundColor: '#F60707' } }}
            titleStyle={styles.buttonText}
            disabledTitleStyle={styles.disabledButtonText}
            onPress={() => {
              destroySession();
              if (showError) {
                setShowError(false);
                setBridgefyStatus(BridgefyStates.ONLINE);
              }
            }}
          />
        </View>
        {showError && <Text style={styles.errorText}>An error occurred, please try again.</Text>}
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars.backgroundColor,
      paddingTop: 20,
    },
    headerContainer: {
      width: '100%',
      backgroundColor: vars.backgroundColor,
    },
    contentContainer: { marginTop: 40, marginHorizontal: 30 },
    title: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightMedium,
      fontSize: 26,
      color: '#DBDCDB',
    },
    subtitle: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightRegular,
      fontSize: 18,
      color: '#656565',
      marginTop: 10,
    },
    inputText: {
      fontFamily: vars.fontFamilyPrimary,
      fontSize: 27,
      fontWeight: vars.fontWeightBold,
      color: '#F60707',
    },
    inputContainer: {
      paddingHorizontal: 0,
      marginTop: 17,
    },
    inputTextContainer: {
      borderBottomWidth: 0,
    },
    warningBubble: {
      backgroundColor: '#1D1313',
      borderColor: '#522727',
      borderWidth: 1,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    warningText: {
      marginHorizontal: 15,
      marginVertical: 5,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightMedium,
      fontSize: 14,
      color: '#DE1D1D',
    },
    keyboardAvoidingView: { flex: 1, flexDirection: 'column-reverse' },
    buttonContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: insets.top + 30,
    },
    buttonText: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightMedium,
      fontSize: 20,
      color: vars.white.sharp,
    },
    disabledButtonText: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightMedium,
      fontSize: 20,
      color: '#707070',
    },
    errorText: {
      textAlign: 'center',
      color: '#F60707',
      marginBottom: 15,
      fontSize: 15,
      fontWeight: vars.fontWeightMedium,
    },
  });

export default DeleteDataPage;
