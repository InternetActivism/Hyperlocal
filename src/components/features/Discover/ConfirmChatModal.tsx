import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme, vars } from '../../../utils/theme';
import Button from '../../ui/Button';
import ProfilePicture from '../../ui/ProfilePicture';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  name: string;
}

const ConfirmationPopup = ({ visible, onConfirm, onCancel, name }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={(event) => {
          if (event.target === event.currentTarget) {
            onCancel();
          }
        }} // Add the onPress prop here
        activeOpacity={1} // Ensure the overlay remains opaque when pressed
      >
        <View style={styles.container}>
          <View style={styles.itemContainer}>
            <Text style={theme.textSectionHeaderLarge}>Create new chat?</Text>
            <View style={styles.nameBox}>
              <ProfilePicture size="md_s" title={name} />
              <Text style={styles.nameText}>{name}</Text>
            </View>
            <Text style={styles.descriptionText}>
              Creating a chat will allow you to send and receive direct messages and long-distance
              mesh messages from {name}.
            </Text>
          </View>
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={onConfirm}>
              <Button title="Create chat" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Change this to 'flex-end'
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute', // Add this line
    bottom: 0, // Add this line
    width: '100%',
    height: 425,
    backgroundColor: '#1B1C1B',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 35,
    paddingTop: 30,
    paddingBottom: 45,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightRegular,
    color: '#87888A',
    marginTop: 25,
  },
  descriptionText: {
    fontSize: 19,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightRegular,
    color: vars.gray.sharp,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  nameText: {
    fontSize: 25,
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightRegular,
    color: vars.gray.text,
    marginLeft: 10,
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConfirmationPopup;
