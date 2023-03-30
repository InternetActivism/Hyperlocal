import { Input, InputProps } from '@rneui/themed';
import React, { PropsWithChildren } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { vars } from '../../utils/theme';

interface Props {
  placeholder: string;
  defaultValue?: string;
  onChangeText: (text: string) => void;
}

const TitleInput = React.forwardRef<TextInput & PropsWithChildren<InputProps>, Props>(
  ({ onChangeText, placeholder, defaultValue }, ref) => {
    return (
      <Input
        ref={ref}
        inputContainerStyle={styles.inputContainer}
        containerStyle={styles.container}
        inputStyle={[styles.input]}
        placeholder={placeholder}
        placeholderTextColor={vars.gray.dark}
        onChangeText={(value) => onChangeText(value)}
        autoFocus={true}
        defaultValue={defaultValue}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 41,
    bottom: 0,
  },
  inputContainer: {
    borderColor: vars.gray.darkest,
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  input: {
    textAlign: 'center',
    fontFamily: vars.fontFamilySecondary,
    color: vars.white.darkest,
    fontSize: vars.fontSizeHeaderSmall,
    fontWeight: vars.fontWeightRegular,
  },
});

export default TitleInput;
