import { Button as RneuiButton } from '@rneui/base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { vars } from '../../utils/theme';

const Button = (props: any) => {
  return (
    <RneuiButton
      buttonStyle={[styles.buttonStyleDefault, props.style]}
      titleStyle={styles.textStyleDefault}
      disabledTitleStyle={styles.textStyleDisabled}
      disabledStyle={styles.buttonStyleDisabled}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  buttonStyleDefault: {
    backgroundColor: vars.primaryColor.button,
    borderRadius: 32,
    height: 50,
    width: 330,
  },
  buttonStyleDisabled: {
    backgroundColor: vars.black.soft,
    borderRadius: 32,
    height: 50,
    width: 330,
  },
  textStyleDefault: {
    color: vars.primaryColor.text,
    fontFamily: vars.fontFamilySecondary,
    fontSize: 22,
    fontWeight: '700',
  },
  textStyleDisabled: {
    color: vars.gray.soft,
    fontFamily: vars.fontFamilySecondary,
    fontSize: 22,
    fontWeight: vars.fontWeightBold,
  },
});

export default Button;
