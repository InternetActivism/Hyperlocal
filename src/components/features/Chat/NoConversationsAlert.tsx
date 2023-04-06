import { useNavigation } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { vars } from '../../../utils/theme';
import PeopleIcon from '../../ui/Icons/PeopleIcon';

const ConversationsEmptyHeader = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
      <View style={styles.publicChatContainer}>
        <View style={styles.publicChatBox}>
          <View style={styles.globeIconContainer}>
            <PeopleIcon />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.text}>You don’t have any contacts!</Text>
            <Text style={styles.subscript}>
              Come within 300ft of another user and add them from the Discover page.
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textBox: {
    flex: 1,
    padding: 5,
  },
  subscript: {
    marginTop: 6,
    fontFamily: vars.fontFamilySecondary,
    fontSize: 13,
    fontWeight: vars.fontWeightRegular,
    color: '#939894',
  },
  publicChatContainer: {
    height: 95,
    marginHorizontal: 15,
    marginBottom: 8,
    marginTop: 12,
  },
  publicChatBox: {
    backgroundColor: vars.backgroundColorSecondary,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    padding: 5,
  },
  globeIconContainer: {
    paddingHorizontal: 17,
  },
  lockIconContainer: {
    position: 'absolute',
    right: 15,
  },
  text: {
    paddingLeft: 2,
    fontFamily: vars.fontFamilySecondary,
    fontSize: 16,
    fontWeight: vars.fontWeightMedium,
    color: '#CACACA',
  },
  chevronContainer: {
    position: 'absolute',
    right: 20,
  },
});

export default ConversationsEmptyHeader;
