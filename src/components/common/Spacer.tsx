import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { vars } from '../../utils/theme';

const Spacer = () => {
  return <View style={styles.line} />;
};

const styles = StyleSheet.create({
  line: {
    height: 2,
    backgroundColor: vars.backgroundColorSecondary,
    marginHorizontal: 25,
    marginVertical: 10,
  },
});

export default Spacer;
