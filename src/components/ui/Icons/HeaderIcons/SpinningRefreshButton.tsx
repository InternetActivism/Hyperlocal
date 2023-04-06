import React, { useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RefreshIconProps {
  callback: () => void;
  disabled?: boolean;
}

const SpinningRefreshIcon = ({ callback, disabled }: RefreshIconProps) => {
  const [spinValue, setSpinValue] = useState(new Animated.Value(0));

  const startSpin = () => {
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setSpinValue(new Animated.Value(0));
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <TouchableOpacity
      onPress={() => {
        startSpin();
        callback();
      }}
      disabled={disabled}
    >
      <View>
        <Animated.Image
          source={require('../../../../assets/images/HeaderIcon11.png')}
          style={[styles.image, { transform: [{ rotate: spin }] }]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 35,
    width: 35,
  },
});

export default SpinningRefreshIcon;
