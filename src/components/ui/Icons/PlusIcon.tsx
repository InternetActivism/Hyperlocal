import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PlusIcon = ({ width = 36, height = 36 }) => (
  <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.5 0.5C15.3954 0.5 14.5 1.39543 14.5 2.5V14.5L2.5 14.5C1.39543 14.5 0.5 15.3954 0.5 16.5V19.5C0.5 20.6046 1.39543 21.5 2.5 21.5H14.5V33.5C14.5 34.6046 15.3954 35.5 16.5 35.5H19.5C20.6046 35.5 21.5 34.6046 21.5 33.5V21.5H33.5C34.6046 21.5 35.5 20.6046 35.5 19.5V16.5C35.5 15.3954 34.6046 14.5 33.5 14.5L21.5 14.5V2.5C21.5 1.39543 20.6046 0.5 19.5 0.5H16.5Z"
      fill="#707770"
    />
  </Svg>
);

export default PlusIcon;
