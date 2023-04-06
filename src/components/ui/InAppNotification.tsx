import { useNavigation } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';
import { useAtom } from 'jotai';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationContentAtom } from '../../services/atoms';
import { vars } from '../../utils/theme';
import GlobeIcon from './Icons/GlobeIcon';
import ProfilePicture from './ProfilePicture';

const PRESS_THRESHOLD = 10;
const ANIMATION_DURATION = 300;
const DURATION = 4000;
const START_POSITION = -150;
const END_POSITION = 0;

export type Content = {
  name: string;
  contactID: string;
  message: string;
  messageID: string;
  isPublic: boolean;
};

type Coordinates = {
  x: number;
  y: number;
};

const InAppNotification = () => {
  const [visible, setVisible] = useState(false);
  const [initialTouch, setInitialTouch] = useState<Coordinates>({ x: 0, y: 0 });
  const [finalTouch, setFinalTouch] = useState<Coordinates>({ x: 100000, y: 100000 });
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [timeoutID, setTimeoutID] = useState<number | null>(null);

  const [contentAtom] = useAtom(notificationContentAtom);

  const navigation = useNavigation<StackNavigationProp<any>>();
  const slideAnim = useRef(new Animated.Value(START_POSITION)).current;

  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        setInitialTouch({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt) => {
        setFinalTouch({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
      },
    })
  ).current;

  const slideIn = React.useCallback(
    (callback?: () => void) => {
      Animated.timing(slideAnim, {
        toValue: END_POSITION,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setVisible(true);
        if (callback) {
          callback();
        }
      });
    },
    [slideAnim]
  );

  const slideOut = React.useCallback(
    (callback?: () => void) => {
      Animated.timing(slideAnim, {
        toValue: START_POSITION,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        if (callback) {
          callback();
        }
      });
    },
    [slideAnim]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    slideIn();

    const disappearTimeout = setTimeout(() => {
      console.debug('timeout triggered');
      slideOut();
    }, DURATION);
    setTimeoutID(disappearTimeout);
  }, [visible, slideIn, slideOut]);

  useEffect(() => {
    if (!contentAtom) {
      return;
    }

    if (visible) {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      slideOut(() => {
        setCurrentContent(contentAtom);
        slideIn();
      });
    } else {
      setCurrentContent(contentAtom);
      slideIn();
    }
  }, [contentAtom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const deltaX = Math.abs(finalTouch.x - initialTouch.x);
    const deltaY = Math.abs(finalTouch.y - initialTouch.y);

    if (deltaX < PRESS_THRESHOLD && deltaY < PRESS_THRESHOLD) {
      if (!currentContent?.contactID) {
        console.error(
          "(InAppNotification) Unable to navigate to chat page, contactID doesn't exist"
        );
        return;
      }

      if (currentContent.isPublic) {
        navigation.navigate('PublicChat');
      } else {
        navigation.navigate('Chat', { user: currentContent.contactID });
      }
      slideOut();
    }

    if (finalTouch.y < initialTouch.y || !visible) {
      slideOut();
    }
  }, [finalTouch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    currentContent && (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {currentContent?.isPublic ? (
          <GlobeIcon size="sm" />
        ) : (
          <View style={styles.ring}>
            <ProfilePicture size="sm" title={currentContent?.name} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.text}>{currentContent?.name}</Text>
          <Text style={styles.body}>{currentContent?.message}</Text>
        </View>
      </Animated.View>
    )
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      flexDirection: 'row',
      top: insets.top,
      left: 10,
      right: 10,
      padding: 10,
      backgroundColor: '#1D1F1D',
      justifyContent: 'flex-start',
      alignItems: 'center',
      zIndex: 9999,
      borderRadius: 7.5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    ring: {
      borderWidth: 1,
      borderColor: vars.primaryColor.soft,
      padding: 2,
      borderRadius: 70,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginLeft: 10,
    },
    text: {
      color: '#D7D7D7',
      fontSize: 15,
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightRegular,
    },
    body: {
      color: '#939393',
      fontSize: 15,
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightRegular,
    },
  });

export default InAppNotification;
