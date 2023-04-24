import React from 'react';
import { Circle, Defs, LinearGradient, Stop, Svg, Text } from 'react-native-svg';
import { vars } from '../../utils/theme';

const sizes = {
  xs: {
    size: 40,
    fontSize: 16,
  },
  sm: {
    size: 42,
    fontSize: 18,
  },
  md: {
    size: 65,
    fontSize: 28,
  },
  lg_s: {
    size: 68,
    fontSize: 32,
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

const ProfilePicture = ({
  size,
  title,
}: {
  size: 'xs' | 'sm' | 'md' | 'lg_s' | 'lg' | 'xl';
  title: string;
}) => {
  const avatarTitle = title
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const length = sizes[size].size;
  const fontSize = sizes[size].fontSize;

  return (
    <Svg width={length} height={length} viewBox={`0 0 ${length} ${length}`}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2={length} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="transparent" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      <Circle fill="#39403A" cx={length / 2} cy={length / 2} r={length / 2 - 2} />
      <Circle fill="url(#grad)" cx={length / 2} cy={length / 2} r={length / 2 - 2} />
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
    </Svg>
  );
};

export default ProfilePicture;
