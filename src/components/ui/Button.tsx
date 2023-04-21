import { Button as RneuiButton, ButtonProps } from '@rneui/base';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { vars } from '../../utils/theme';

const BORDER_RADIUS = 32;

interface Props extends ButtonProps {
  styles?: {
    wrapper?: StyleProp<ViewStyle>;
    button?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
}

const Button = (props: Props) => {
  return (
    <View style={[styles.buttonWrapper, props.styles?.wrapper]}>
      <RneuiButton
        buttonStyle={[styles.buttonStyleDefault, props.styles?.button]}
        titleStyle={[styles.textStyleDefault, props.styles?.text]}
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
    // height: '100%',
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
