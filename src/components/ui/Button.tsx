import { Button as RneuiButton, Text } from '@rneui/base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { vars } from '../../utils/theme';

const Button = (props: any) => {
  return (
    <RneuiButton
      buttonStyle={[styles.buttonStyleDefault, props.style]}
      disabledStyle={styles.buttonStyleDisabled}
      {...props}
    >
      <Text style={props.disabled ? styles.textStyleDisabled : styles.textStyleDefault}>
        {props.text}
      </Text>
    </RneuiButton>
  );
};

const styles = StyleSheet.create({
  buttonStyleDefault: {
    backgroundColor: vars.green.button,
    borderRadius: vars.borderRadiusRound,
    height: 50,
    width: 330,
  },
  buttonStyleDisabled: {
    backgroundColor: vars.black.soft,
    borderRadius: vars.borderRadiusRound,
    height: 50,
    width: 330,
  },
  textStyleDefault: {
    color: vars.green.text,
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
