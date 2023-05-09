import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  selected: boolean;
}

function DiscoverIcon({ selected }: Props) {
  const color = selected ? '#09F41D' : '#A4A4A4';
  return (
    <Svg width={35} height={36} fill="none">
      <Circle cx={14.125} cy={14.116} r={11.458} stroke={color} strokeWidth={4} />
      <Path stroke={color} strokeLinecap="round" strokeWidth={4} d="m23.242 23.232 9.09 10.11" />
    </Svg>
  );
}

export default DiscoverIcon;
