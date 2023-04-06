import { Input as BaseInput } from '@rneui/base';
import { Input } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { theme } from '../../utils/theme';

type Props = {
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
};
type Ref = TextInput & BaseInput;

// TODO: figure out ref type
const CustomTextInput = React.forwardRef<Ref, Props>(({ onChangeText, autoFocus }, ref) => {
  return (
    <Input
      ref={ref}
      inputContainerStyle={styles.inputContainer}
      containerStyle={styles.container}
      inputStyle={[styles.input, theme.textLarge]}
      placeholder="Chat"
      onChangeText={(value) => onChangeText(value)}
      autoFocus={autoFocus || false}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171917',
    height: 41,
    borderRadius: 10,
    borderColor: 'transparent',
    marginHorizontal: 9,
    bottom: 0,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  input: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    marginLeft: 6,
  },
});

export default CustomTextInput;
