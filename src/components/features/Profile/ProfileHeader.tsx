import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ChevronRightIcon from '../../ui/Icons/ChevronRightIcon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ProfileHeader = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>Profile</Text>
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
    paddingHorizontal: 53,
    top: 0,
  },
  textContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 18.5,
    backgroundColor: '#F2F2F5',
  },
  nameText: {
    fontSize: 26,
    fontFamily: 'Helvetica',
    fontWeight: '700',
  },
});

export default ProfileHeader;
