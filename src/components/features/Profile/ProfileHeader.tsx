import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import ChevronRightIcon from '../../ui/Icons/ChevronRightIcon';

const ProfileHeader = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={theme.textPageTitle}>Profile</Text>
      </View>

      <Button
        buttonStyle={styles.backButton}
        icon={<ChevronRightIcon />}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    paddingHorizontal: 60,
  },
  textContainer: {
    width: '100%',
    height: '100%',
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 32,
    backgroundColor: vars.backgroundColorSecondary,
  },
});

export default ProfileHeader;
