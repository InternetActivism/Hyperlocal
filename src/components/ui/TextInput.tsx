import { Input } from '@rneui/themed';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  text: string;
  onChangeText: (text: string) => void;
}

const TextInput = ({ text, onChangeText }: Props) => {
  return (
    <Input
      inputContainerStyle={styles.inputContainer}
      containerStyle={styles.container}
      inputStyle={styles.input}
      placeholder="Chat"
      onChangeText={value => onChangeText(value)}
    />
  );
};

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

export default TextInput;
