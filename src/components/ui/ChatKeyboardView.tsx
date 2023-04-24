import { useFocusEffect } from '@react-navigation/native';
import { Input as BaseInput } from '@rneui/base';
import { Button } from '@rneui/themed';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { vars } from '../../utils/theme';
import MeshConfirmation from '../features/Chat/MeshConfirmation';
import CustomTextInput from './CustomTextInput';
import SendIcon from './Icons/SendIcon/SendIcon';
import SendIconDisabled from './Icons/SendIcon/SendIconDisabled';
import SendIconMesh from './Icons/SendIcon/SendIconMesh';

interface Props {
  bubbles: JSX.Element;
  buttonState: 'Enabled' | 'Mesh' | 'Disabled';
  sendTextHandler: (text: string) => void;
  placeholders: {
    Enabled: string;
    Mesh: string;
    Disabled: string;
  };
  overlayOpacityValue?: Animated.Value;
}

const KeyboardView = ({
  bubbles,
  buttonState,
  sendTextHandler,
  placeholders,
  overlayOpacityValue,
}: Props) => {
  const [messageText, setMessageText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [showMeshConfirmation, setShowMeshConfirmation] = useState(false);

  const input: React.RefObject<TextInput & BaseInput> = createRef<TextInput & BaseInput>();
  const scrollViewRef: React.RefObject<ScrollView> = useRef<ScrollView>(null);

  const isMessageDisabled = messageText === '';

  const sendMessage = () => {
    if (input.current) {
      input.current.clear();
      setMessageText('');
      sendTextHandler(messageText);
    }
  };

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
      <View style={styles.overlayContainer}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacityValue ?? 0,
            },
          ]}
          pointerEvents="none"
        />
        <ScrollView
          style={styles.scrollContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollDown()}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {bubbles}
        </ScrollView>
      </View>
      <View style={styles.popUpContainer}>
        {overlayOpacityValue && (
          <MeshConfirmation
            visible={showMeshConfirmation}
            setVisible={setShowMeshConfirmation}
            overlayOpacity={overlayOpacityValue}
            sendMessage={sendMessage}
          />
        )}
        <View style={styles.inputContainer}>
          <CustomTextInput
            ref={input}
            onChangeText={(value: string) => {
              setMessageText(value);
            }}
            autoFocus={isFocused}
            placeholder={placeholders[buttonState]}
          />
          <Button
            icon={
              isMessageDisabled || buttonState === 'Disabled' ? (
                <SendIconDisabled />
              ) : buttonState === 'Enabled' ? (
                <SendIcon />
              ) : (
                <SendIconMesh />
              )
            }
            buttonStyle={styles.sendButton}
            disabledStyle={styles.sendButton}
            disabled={(isMessageDisabled || buttonState === 'Disabled') && false}
            onPress={() => {
              if (buttonState === 'Enabled') {
                sendMessage();
              } else if (buttonState === 'Mesh') {
                setShowMeshConfirmation(true);
              }
            }}
          />
        </View>
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
    marginBottom: 50,
  },
  contentContainer: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  popUpContainer: { flexDirection: 'column' },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: vars.backgroundColorSecondary,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: vars.backgroundColorSecondary,
  },
  overlayContainer: { flex: 1 },
  overlay: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: vars.backgroundColor,
  },
});

export default KeyboardView;
