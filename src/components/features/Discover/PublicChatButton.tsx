import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { vars } from '../../../utils/theme';
import AlertBubble from '../../ui/AlertBubble';
import GlobeIcon from '../../ui/Icons/GlobeIcon';

const PublicChatButton = ({ connections }: { connections: Array<string> }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('PublicChat')}>
      <View style={styles.publicChatContainer}>
        <View style={styles.publicChatBox}>
          <View style={styles.globeIconContainer}>
            <GlobeIcon />
          </View>
          <View>
            <Text style={styles.text}>Public Chat</Text>
            <View style={styles.comingSoonContainer}>
              <AlertBubble
                primary={true}
                text={`${connections.length ? connections.length : 'None'} nearby`}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nearbyPeersAvatarContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
  },
  avatarContainer: {
    paddingRight: 25,
  },
  scrollViewContentContainerStyle: {
    paddingLeft: 20,
  },
  publicChatContainer: {
    height: 95,
    marginHorizontal: 15,
    marginBottom: 18,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: vars.backgroundColorSecondary,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    alignItems: 'center',
  },
  globeIconContainer: {
    paddingHorizontal: 17,
  },
  comingSoonContainer: {
    marginTop: 6,
  },
  lockIconContainer: {
    position: 'absolute',
    right: 15,
  },
  text: {
    paddingLeft: 2,
    fontFamily: vars.fontFamilyPrimary,
    fontSize: 22,
    fontWeight: vars.fontWeightMedium,
    color: '#E6F6E7',
  },
});

export default PublicChatButton;
