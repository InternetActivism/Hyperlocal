import { Input } from '@rneui/themed';
import React, { Ref } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { vars } from '../../utils/theme';

interface Props {
  text: string;
  onChangeText: (text: string) => void;
}
type Ref = React.RefObject<TextInput>;

// TODO: figure out ref type
const TitleInput = React.forwardRef<any, Props>(({ text, onChangeText }, ref) => {
  return (
    <Input
      ref={ref}
      inputContainerStyle={styles.inputContainer}
      containerStyle={styles.container}
      inputStyle={[styles.input]}
      placeholder="Type here..."
      placeholderTextColor={vars.gray.dark}
      value={text}
      onChangeText={(value) => onChangeText(value)}
    />
  );
});

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
