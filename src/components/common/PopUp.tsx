import { Button, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PopUpProps {
  title: string;
  children?: React.ReactNode;
  buttonText: string;
  onPress: () => void;
}

const PopUp = ({ title, children, buttonText, onPress }: PopUpProps) => {
  return (
    <View style={styles.popUp}>
      <Text style={styles.popUpTitleText}>{title}</Text>
      <Text style={styles.popUpDescriptionText}>{children}</Text>
      <Button
        title={buttonText}
        buttonStyle={styles.popUpButton}
        titleStyle={styles.popUpButtonTitle}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  popUp: {
    width: '100%',
    backgroundColor: '#171917',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#303230',
    padding: 20,
    alignItems: 'center',
  },
  popUpTitleText: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    paddingBottom: 8,
  },
  popUpDescriptionText: {
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    fontWeight: '400',
    color: '#939893',
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  popUpLinkText: {
    textDecorationLine: 'underline',
  },
  popUpButton: {
    width: 290,
    height: 50,
    backgroundColor: '#193C2A',
    borderRadius: 32,
  },
  popUpButtonTitle: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    color: '#1DDE2D',
  },
});

export default PopUp;
