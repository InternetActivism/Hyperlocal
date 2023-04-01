import { Button as RneuiButton } from '@rneui/base';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

const BORDER_RADIUS = 32;

const Button = (props: any) => {
  return (
    <View style={styles.buttonWrapper}>
      <RneuiButton
        buttonStyle={[styles.buttonStyleDefault, props.style]}
        titleStyle={styles.textStyleDefault}
        disabledTitleStyle={styles.textStyleDisabled}
        disabledStyle={styles.buttonStyleDisabled}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  buttonStyleDefault: {
    backgroundColor: vars.primaryColor.button,
    borderRadius: BORDER_RADIUS,
    height: 50,
    width: 330,
    overflow: 'hidden',
  },
  buttonStyleDisabled: {
    backgroundColor: vars.black.soft,
    borderRadius: BORDER_RADIUS,
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
    fontWeight: vars.fontWeightSemibold,
  },
});

export default Button;
