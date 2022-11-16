import { Input } from '@rneui/themed';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const TextInput = () => {
  const [text, setText] = useState('');

  return (
    <Input
      inputContainerStyle={styles.inputContainer}
      containerStyle={styles.container}
      inputStyle={styles.input}
      placeholder="Chat"
      onChangeText={value => setText(value)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
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
