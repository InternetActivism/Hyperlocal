import { useFocusEffect } from '@react-navigation/native';
import { Input as BaseInput } from '@rneui/base';
import { Button } from '@rneui/themed';
import React, { createRef, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { vars } from '../../utils/theme';
import CustomTextInput from './CustomTextInput';
import SendIcon from './Icons/SendIcon/SendIcon';
import SendIconDisabled from './Icons/SendIcon/SendIconDisabled';

interface Props {
  bubbles: JSX.Element;
  buttonState: boolean;
  sendText: (text: string) => void;
}

const KeyboardView = ({ bubbles, buttonState, sendText }: Props) => {
  const [messageText, setMessageText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const input: React.RefObject<TextInput & BaseInput> = createRef<TextInput & BaseInput>();
  const scrollViewRef: React.RefObject<ScrollView> = useRef<ScrollView>(null);

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

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        if (input.current) {
          input.current.focus();
          setIsFocused(true);
        }
      }, 200); // Adjust the timeout value according to your screen transition duration

      return () => {
        clearTimeout(timer);
        setIsFocused(false);
      };
    }, [input])
  );

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollDown()}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {bubbles}
      </ScrollView>
      <View style={styles.inputContainer}>
        <CustomTextInput
          ref={input}
          onChangeText={(value: string) => {
            setMessageText(value);
          }}
          autoFocus={isFocused}
        />
        <Button
          icon={buttonState && !isMessageDisabled ? <SendIcon /> : <SendIconDisabled />}
          buttonStyle={styles.sendButton}
          disabledStyle={styles.sendButtonDisabled}
          disabled={isMessageDisabled || !buttonState}
          onPress={() => {
            if (buttonState && input.current) {
              input.current.clear();
              setMessageText('');
              sendText(messageText);
            }
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: vars.backgroundColor,
    flex: 1,
  },
  contentContainer: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: vars.backgroundColorSecondary,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    backgroundColor: vars.backgroundColorSecondary,
  },
});

export default KeyboardView;
