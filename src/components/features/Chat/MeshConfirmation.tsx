import { Text } from '@rneui/base';
import { useAtom } from 'jotai';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet } from 'react-native';
import {
  allContactsAtom,
  connectionInfoAtom,
  contactInfoAtom,
  currentViewAtom,
} from '../../../services/atoms';
import { getConnectionName } from '../../../services/connections';
import { vars } from '../../../utils/theme';
import Button from '../../ui/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

let END_POSITION = 500;
const START_POSITION = -60;

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  overlayOpacity: Animated.Value;
  sendMessage: () => void;
};

const MeshConfirmation = ({ visible, setVisible, overlayOpacity, sendMessage }: Props) => {
  const [allContacts] = useAtom(allContactsAtom);
  const [allContactsInfo] = useAtom(contactInfoAtom);
  const [connectionInfo] = useAtom(connectionInfoAtom);
  const [currentView] = useAtom(currentViewAtom);

  const name = !currentView
    ? 'This user'
    : allContacts.includes(currentView)
    ? allContactsInfo[currentView].nickname
    : getConnectionName(currentView, connectionInfo);

  const position = useRef(new Animated.Value(100)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newPosition = gestureState.dy;

        if (gestureState.dy >= 0) {
          newPosition = 60 * Math.atan(gestureState.dy / 60);
        } else {
          newPosition = 20 * Math.atan(gestureState.dy / 20);
        }

        position.setValue(END_POSITION + newPosition - 60);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          slideOut();
        } else {
          slideIn();
        }
      },
    })
  ).current;

  const slideIn = useCallback(() => {
    Animated.timing(position, {
      toValue: END_POSITION - 60,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue: 0.4,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity, position, overlayOpacity]);

  const slideOut = useCallback(() => {
    Animated.timing(position, {
      toValue: START_POSITION,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setVisible(false);
  }, [contentOpacity, position, overlayOpacity, setVisible]);

  useEffect(() => {
    if (visible) {
      slideIn();
    }
  }, [visible, slideIn, slideOut]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: position }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
          },
        ]}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          END_POSITION = -1 * height;
        }}
      >
        <Text style={styles.title}>
          {`${name} isn’t connected, hand-off your message to nearby users?`}
        </Text>
        <Text style={styles.description}>
          Those nearby will save your message and forward it to those around them. Don’t worry, only
          the intended recipient can read the content of your message.
        </Text>
        <Button
          styles={{
            wrapper: { marginTop: 20 },
            button: { width: 250 },
          }}
          titleStyle={styles.handoffButtonText}
          onPress={() => {
            sendMessage();
            slideOut();
          }}
        >
          Hand-off
        </Button>
        <Button
          styles={{
            wrapper: { marginTop: 10 },
            button: { width: 250, backgroundColor: 'transparent' },
          }}
          onPress={() => slideOut()}
          titleStyle={styles.cancelButtonText}
        >
          Cancel
        </Button>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: SCREEN_HEIGHT,
    flexDirection: 'column',
    backgroundColor: vars.backgroundColorSecondary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    fontFamily: vars.fontFamilyPrimary,
    fontWeight: vars.fontWeightRegular,
    fontSize: vars.fontSizeBodyLarge,
    color: '#DBDCDB',
    textAlign: 'center',
    width: '70%',
    marginVertical: 18,
  },
  connectionsContainer: { flexDirection: 'row', marginBottom: 17, gap: 12 },
  profilePictureContainer: { flexDirection: 'column' },
  ring: {
    borderWidth: 1.75,
    borderColor: vars.primaryColor.soft,
    padding: 1,
    borderRadius: 70,
  },
  connectionName: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 10.5,
    fontWeight: vars.fontWeightRegular,
    color: vars.white.sharp,
    textAlign: 'center',
    marginTop: 5,
  },
  description: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: vars.fontSizeSmall,
    fontWeight: vars.fontWeightRegular,
    color: '#8F8F8F',
    textAlign: 'center',
    width: '90%',
  },
  handoffButtonText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 16,
    color: vars.green.text,
    fontWeight: vars.fontWeightMedium,
  },
  cancelButtonText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 16,
    color: '#87888A',
    fontWeight: vars.fontWeightRegular,
  },
});

export default MeshConfirmation;
