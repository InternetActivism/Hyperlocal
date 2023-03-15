import { Button } from '@rneui/themed';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import SendIcon from './Icons/SendIcon/SendIcon';
import SendIconDisabled from './Icons/SendIcon/SendIconDisabled';
import { vars } from '../../utils/theme';
import CustomTextInput from './CustomTextInput';

interface Props {
  bubbles: JSX.Element[];
  buttonState: boolean;
  sendText: (text: string) => void;
}

const KeyboardView = ({ bubbles, buttonState, sendText }: Props) => {
  const [messageText, setMessageText] = useState<string>('');

  const input: any = createRef();
  const scrollViewRef: any = useRef();

  const isMessageDisabled = messageText === '';

  // Scroll down to bottom of chat.
  const scrollDown = () => {
    if (scrollViewRef.current === null) {
      return;
    }
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  // Scroll down when keyboard is shown.
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollDown();
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollDown()}
        >
          {bubbles}
        </ScrollView>
        <View style={styles.inputContainer}>
          <CustomTextInput
            ref={input}
            onChangeText={(value: string) => {
              setMessageText(value);
            }}
          />
          <Button
            icon={buttonState && !isMessageDisabled ? <SendIcon /> : <SendIconDisabled />}
            buttonStyle={styles.sendButton}
            disabledStyle={styles.sendButtonDisabled}
            disabled={isMessageDisabled && !buttonState}
            onPress={() => {
              if (buttonState) {
                input.current.clear();
                setMessageText('');
                sendText(messageText);
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
      <View style={styles.spacer} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: vars.backgroundColor,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: vars.backgroundColorSecondary,
    paddingTop: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: vars.backgroundColorSecondary,
  },
  sendButtonDisabled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: vars.backgroundColorSecondary,
  },
  spacer: {
    height: 25,
    backgroundColor: vars.backgroundColorSecondary,
  },
});

export default KeyboardView;
