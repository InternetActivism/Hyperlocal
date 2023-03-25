import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

interface PopUpProps {
  title: string;
  children?: React.ReactNode;
  buttonText: string;
  onPress: () => void;
}

const PopUp = ({ title, children, buttonText, onPress }: PopUpProps) => {
  return (
    <View style={styles.popUp}>
      <Text style={styles.popUpTitleText}>{title}</Text>
      <Text style={styles.popUpDescriptionText}>{children}</Text>
      <Button
        title={buttonText}
        buttonStyle={styles.popUpButton}
        titleStyle={styles.popUpButtonTitle}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  popUp: {
    width: '100%',
    backgroundColor: '#171917',
    borderRadius: 13,
    padding: 20,
    alignItems: 'center',
  },
  popUpTitleText: {
    fontSize: 20,
    fontFamily: vars.fontFamilyPrimary,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.sharp,
    paddingBottom: 8,
  },
  popUpDescriptionText: {
    fontSize: 15,
    fontFamily: vars.fontFamilyPrimary,
    fontWeight: vars.fontWeightRegular,
    color: vars.gray.soft,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
  },
  popUpButton: {
    width: 290,
    height: 50,
    backgroundColor: '#2D2E2D',
    borderRadius: 32,
  },
  popUpButtonTitle: {
    fontSize: 20,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightMedium,
    color: '#ABB2AB',
  },
});

export default PopUp;
