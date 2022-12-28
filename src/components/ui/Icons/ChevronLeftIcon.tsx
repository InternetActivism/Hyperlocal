import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChevronLeftIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    {...props}
    style={{
      transform: [{ rotateY: '180deg' }, { scale: 1.5 }],
    }}
  >
    <Path
      fill="#757577"
      stroke="#757577"
      d="M16.066 12.146a.5.5 0 0 1 0 .707l-6.01 6.01a.5.5 0 0 1-.708 0L7.934 17.45a.5.5 0 0 1 0-.708l4.247-4.246L7.934 8.25a.5.5 0 0 1 .001-.709L9.35 6.135a.5.5 0 0 1 .707.001l6.01 6.01z"
    />
  </Svg>
);

export default ChevronLeftIcon;
