import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Text } from '@rneui/themed';
import ChevronLeftIcon from 'components/ui/Icons/ChevronLeftIcon';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, vars } from 'utils/theme';

const StackHeader = ({ title }: { title: string }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <Button
          buttonStyle={styles.backButton}
          icon={<ChevronLeftIcon />}
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={theme.textPageTitle}>{title}</Text>
      </View>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 21,
  },
  backButtonContainer: {
    position: 'absolute',
    marginLeft: 13,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 32,
    backgroundColor: vars.backgroundColorSecondary,
  },
});

export default StackHeader;
