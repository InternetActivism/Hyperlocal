import { Input, InputProps } from '@rneui/themed';
import React, {
  ForwardedRef,
  PropsWithChildren,
  Ref,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

interface Props {
  // props: { text: string; onChangeText: (text: string) => void };
  // ref: any;
  text: string;
  onChangeText: (text: string) => void;
}
type Ref = React.RefObject<TextInput>;

// TODO: figure out ref type
const CustomTextInput = React.forwardRef<any, Props>(
  ({ text, onChangeText }, ref) => {
    return (
      <Input
        ref={ref}
        inputContainerStyle={styles.inputContainer}
        containerStyle={styles.container}
        inputStyle={styles.input}
        placeholder="Chat"
        onChangeText={value => onChangeText(value)}
      />
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    height: 41,
    borderRadius: 20.5,
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
    fontFamily: 'Rubik-Regular',
    fontSize: 17,
  },
});

export default CustomTextInput;
