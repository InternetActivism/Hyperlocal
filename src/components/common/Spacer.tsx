import * as React from 'react';
import { StyleSheet, View } from 'react-native';

const Spacer = () => {
  return <View style={styles.line} />;
};

const styles = StyleSheet.create({
  line: {
    height: 2,
    backgroundColor: '#F6F6F6',
    marginHorizontal: 25,
  },
});

export default Spacer;
