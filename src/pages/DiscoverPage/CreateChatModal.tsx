import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/base';
import { useAtom, useSetAtom } from 'jotai';
import { default as React, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import ProfilePicture from '../../components/ui/ProfilePicture';
import {
  activeConnectionsAtom,
  allContactsAtom,
  connectionInfoAtom,
  connectionInfoAtomInterface,
  createChatWithUserAtom,
  SecureStatus,
  StoredConnectionInfo,
} from '../../services/atoms';
import { establishSecureConnection, refreshSDK } from '../../services/bridgefy-link';
import { getConnectionName } from '../../services/connections';
import { vars } from '../../utils/theme';

enum ModalState {
  CREATE = 0,
  CONNECTING,
  FAILED,
}

const { height: screenHeight } = Dimensions.get('window');

const START_POSITION = screenHeight;
let END_POSITION = screenHeight;
const ANIMATION_DURATION = 300;

const CreateChatModal = () => {
  const [chatContact, setChatContact] = useAtom(createChatWithUserAtom);
  const [connectionInfo] = useAtom(connectionInfoAtomInterface);
  const setAllConnectionInfo = useSetAtom(connectionInfoAtom);
  const [connectingText, setConnectingText] = useState('Connecting');
  const [modalState, setModalState] = useState<number>(ModalState.CREATE);
  const [connections] = useAtom(activeConnectionsAtom);
  const [allContacts] = useAtom(allContactsAtom);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const position = useRef(new Animated.Value(START_POSITION)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const connectionName = chatContact
    ? getConnectionName(chatContact, connectionInfo)
    : 'Unknown User';

  const connectedToUser = connections.includes(chatContact ?? '');

  let connectingInterval: number = 0;
  let failedTimeout: number = 0;

  const slideIn = useCallback(() => {
    Animated.timing(position, {
      toValue: END_POSITION,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue: 0.4,
      duration: ANIMATION_DURATION / 2,
      useNativeDriver: false,
    }).start();
  }, [position, overlayOpacity]);

  const slideOut = useCallback(() => {
    Animated.timing(position, {
      toValue: START_POSITION,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start(() => {
      setChatContact(undefined);
      setModalState(ModalState.CREATE);
      clearInterval(connectingInterval);
      clearTimeout(failedTimeout);
    });

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: ANIMATION_DURATION / 2,
      useNativeDriver: false,
    }).start();
  }, [position, overlayOpacity, setChatContact, connectingInterval, failedTimeout]);

  useEffect(() => {
    if (chatContact !== undefined) {
      slideIn();
    } else if (chatContact === undefined) {
      slideOut();
    }
  }, [chatContact, slideIn, slideOut]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newPosition = gestureState.dy;

        if (gestureState.dy >= 0) {
          newPosition = 100 * Math.atan(gestureState.dy / 100);
        } else {
          newPosition = 30 * Math.atan(gestureState.dy / 30);
        }

        position.setValue(END_POSITION + newPosition);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 200) {
          slideOut();
        } else {
          slideIn();
        }
      },
    })
  ).current;

  const createChat = () => {
    if (!chatContact) {
      console.error('(createChat) Create chat button clicked without a chatContact');
      return;
    }

    if (allContacts.includes(chatContact)) {
      slideOut();
      navigation.navigate('Chat', { contact: chatContact });
      return;
    }

    setModalState(ModalState.CONNECTING);
    connectingInterval = setInterval(() => {
      setConnectingText((prev) => {
        if (prev === 'Connecting...') {
          return 'Connecting';
        } else {
          return `${prev}.`;
        }
      });
    }, 1000);

    failedTimeout = setTimeout(() => {
      clearInterval(connectingInterval);
      setModalState(ModalState.FAILED);
    }, 15000);
  };

  // When establishing a secure connection fails, restart the SDK
  // This will disconnect everyone and reconnect before
  // trying to establish a secure connection again
  useEffect(() => {
    const newContactInfo: StoredConnectionInfo | undefined = connectionInfo.get(chatContact ?? '');
    if (!newContactInfo) {
      return;
    }

    if (
      newContactInfo.secureStatus === SecureStatus.FAILED &&
      modalState === ModalState.CONNECTING
    ) {
      refreshSDK();
    }
  }, [chatContact, connectionInfo, modalState]);

  // When the user accepts the chat request, navigate to the chat screen
  useEffect(() => {
    if (chatContact === undefined) {
      return;
    }

    if (allContacts.includes(chatContact)) {
      slideOut();
      navigation.navigate('Chat', { user: chatContact });
    }
  }, [allContacts, chatContact, navigation, slideOut]);

  // When the modal state updates to connecting or you re-connect with the user
  // Try to establish a secure connection
  useEffect(() => {
    if (!connectedToUser || !chatContact) {
      return;
    }

    if (modalState === ModalState.CONNECTING) {
      setAllConnectionInfo((prev) => {
        const oldConnectionInfo = prev.get(chatContact);
        if (!oldConnectionInfo) {
          return prev;
        }

        prev.set(chatContact, {
          ...oldConnectionInfo,
          secureStatus: SecureStatus.PENDING,
        });
        return new Map(prev);
      });

      establishSecureConnection(chatContact);
    }
  }, [chatContact, connectedToUser, modalState, setAllConnectionInfo]);

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
        pointerEvents={chatContact === undefined ? 'none' : 'box-only'}
      />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: position }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={styles.contentContainer}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            END_POSITION = screenHeight - height - insets.bottom;
          }}
        >
          <View style={styles.pill} />
          <Text style={styles.title}>Create new chat?</Text>
          <View style={styles.contactContainer}>
            <View style={styles.ring}>
              <ProfilePicture size="sm" title={connectionName} />
            </View>
            <Text style={styles.profileName}>{connectionName}</Text>
          </View>
          <Text style={styles.description}>
            {`Starting a chat with "${connectionName}" will allow the to directly message you. You will be able to access your conversation via the Messages page.`}
          </Text>
          <View style={styles.buttonContainer}>
            {modalState === ModalState.CREATE ? (
              <Button
                title={'Create Chat'}
                styles={{
                  button: { width: 300 },
                }}
                onPress={() => createChat()}
              />
            ) : modalState === ModalState.CONNECTING ? (
              <Button
                title={connectingText}
                styles={{
                  button: { width: 300, backgroundColor: '#292B29' },
                  text: { color: '#8C8C8C' },
                }}
                onPress={() => {}}
              />
            ) : (
              <Button
                title={'Failed, retry?'}
                styles={{
                  button: { width: 300, backgroundColor: '#51110F' },
                  text: { color: vars.red.soft },
                }}
                onPress={() => createChat()}
              />
            )}
          </View>
          <Button
            styles={{
              wrapper: { marginVertical: 20 },
              button: { width: 300, backgroundColor: 'transparent' },
            }}
            onPress={() => slideOut()}
            titleStyle={styles.closeButtonText}
          >
            Close
          </Button>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 1,
    backgroundColor: vars.backgroundColor,
  },
  container: {
    backgroundColor: vars.backgroundColor,
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentContainer: { flexDirection: 'column', alignItems: 'center', width: '100%' },
  pill: {
    backgroundColor: '#626262',
    width: 35,
    height: 5,
    borderRadius: 35,
    marginTop: 10,
  },
  title: {
    fontFamily: vars.fontFamilySecondary,
    fontSize: 24,
    fontWeight: vars.fontWeightMedium,
    color: '#DBDCDB',
    marginTop: 25,
  },
  contactContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  profileName: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 26,
    fontWeight: vars.fontWeightRegular,
    color: vars.gray.text,
    marginLeft: 10,
  },
  ring: {
    borderWidth: 1.5,
    borderColor: vars.gray.soft,
    borderRadius: 70,
  },
  description: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 18,
    color: vars.gray.sharp,
    fontWeight: vars.fontWeightRegular,
    width: '87%',
    textAlign: 'center',
    marginTop: 22,
  },
  closeButtonText: {
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 20,
    color: '#87888A',
    fontWeight: vars.fontWeightRegular,
  },
  buttonContainer: { marginTop: 25 },
});

export default CreateChatModal;
