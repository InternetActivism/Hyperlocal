import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, Defs, LinearGradient, Stop, Svg, Text } from 'react-native-svg';
import { vars } from '../../utils/theme';
import PlusIcon from './Icons/PlusIcon';

const sizes = {
  sm: {
    size: 42,
    fontSize: 18,
  },
  md: {
    size: 64,
    fontSize: 28,
  },
  lg: {
    size: 80,
    fontSize: 38,
  },
  xl: {
    size: 122,
    fontSize: 56,
  },
};

type Props = {
  size: 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  isContact?: boolean;
};

const ProfilePicture = ({ size, title, isContact = true }: Props) => {
  const avatarTitle = title
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const length = sizes[size].size;
  const fontSize = sizes[size].fontSize;

  const styles = getStyles(length);

  return (
    <Svg width={length} height={length} viewBox={`0 0 ${length} ${length}`}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2={length} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="transparent" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      <Circle fill="#39403A" cx={length / 2} cy={length / 2} r={length / 2} />
      <Circle fill="url(#grad)" cx={length / 2} cy={length / 2} r={length / 2} />
      {isContact ? (
        <Text
          x={length / 2}
          y={length / 2}
          fontSize={fontSize}
          textAnchor="middle"
          fontFamily={vars.fontFamilyMonospace}
          fontWeight={vars.fontWeightSemibold}
          fill="#9AA39B"
          dy={fontSize / 3}
        >
          {avatarTitle}
        </Text>
      ) : (
        <View style={styles.plusContainer}>
          <PlusIcon width={length / 2} height={length / 2} />
        </View>
      )}
    </Svg>
  );
};

const getStyles = (length: number) =>
  StyleSheet.create({
    plusContainer: {
      width: length,
      height: length,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default ProfilePicture;
