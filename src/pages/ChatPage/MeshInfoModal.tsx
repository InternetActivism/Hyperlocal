import { Text } from '@rneui/base';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import { vars } from '../../utils/theme';

type Props = {
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const MeshInfoModal = ({ setIsModalVisible }: Props) => {
  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.pillContainer}>
        <View style={styles.pill} />
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Mesh Network Messaging</Text>
        <Text style={styles.question}>Q: What is Mesh Network Messaging?{'\n'}</Text>
        <Text style={styles.answer}>
          A: Mesh Network Messaging is a decentralized communication method that allows you to send
          encrypted messages to recipients, even when they're not directly connected to you.{'\n'}
        </Text>
        <Text style={styles.question}>Q: How does it work?{'\n'}</Text>
        <Text style={styles.answer}>
          A: Your message is encrypted for privacy and security, then passed along from one user to
          another within the network until it reaches the intended recipient.
          {'\n'}
        </Text>
        <Text style={styles.question}>Q: Is message delivery guaranteed?{'\n'}</Text>
        <Text style={styles.answer}>
          A: No, message delivery is not guaranteed as it depends on the connections between users
          within the network.{'\n\n'}
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button onPress={() => setIsModalVisible(false)}>Got It</Button>
      </View>
    </View>
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    pageContainer: { backgroundColor: '#1B1C1B', height: '100%' },
    scrollView: {
      width: '100%',
      height: '100%',
      backgroundColor: '#1B1C1B',
      paddingHorizontal: 35,
      marginBottom: insets.bottom + 10 + 25,
    },
    title: {
      fontFamily: vars.fontFamilySecondary,
      fontWeight: vars.fontWeightMedium,
      fontSize: 24,
      textAlign: 'center',
      width: '100%',
      color: '#DBDCDB',
      marginVertical: 20,
    },
    question: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightRegular,
      fontSize: vars.fontSizeBodyLarge,
      color: vars.gray.soft,
    },
    answer: {
      fontFamily: vars.fontFamilyPrimary,
      fontWeight: vars.fontWeightRegular,
      fontSize: vars.fontSizeBodyLarge,
      color: vars.gray.sharp,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 10,
      width: '100%',
      alignItems: 'center',
    },
    pillContainer: { width: '100%', alignItems: 'center', marginVertical: 10 },
    pill: {
      backgroundColor: '#626262',
      width: 35,
      height: 5,
      borderRadius: 5,
    },
  });

export default MeshInfoModal;
