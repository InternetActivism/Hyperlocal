import { Input } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { theme } from '../../utils/theme';

interface Props {
  // props: { text: string; onChangeText: (text: string) => void };
  // ref: any;
  onChangeText: (text: string) => void;
}
type Ref = React.RefObject<TextInput>;

// TODO: figure out ref type
const CustomTextInput = React.forwardRef<any, Props>(({ onChangeText }, ref) => {
  return (
    <Input
      ref={ref}
      inputContainerStyle={styles.inputContainer}
      containerStyle={styles.container}
      inputStyle={[styles.input, theme.textLarge]}
      placeholder="Chat"
      onChangeText={(value) => onChangeText(value)}
      autoFocus={true}
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
    marginBottom: 8,
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
