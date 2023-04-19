import React from 'react';
import Svg, { Path } from 'react-native-svg';

const InfoIcon = () => {
  return (
    <Svg width="8" height="9" viewBox="0 0 8 9" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 4.33948C8 6.54862 6.20914 8.33948 4 8.33948C1.79086 8.33948 0 6.54862 0 4.33948C0 2.13034 1.79086 0.339478 4 0.339478C6.20914 0.339478 8 2.13034 8 4.33948ZM4.57157 2.6252C4.57157 2.94079 4.31573 3.19663 4.00014 3.19663C3.68455 3.19663 3.42871 2.94079 3.42871 2.6252C3.42871 2.30961 3.68455 2.05377 4.00014 2.05377C4.31573 2.05377 4.57157 2.30961 4.57157 2.6252ZM4.5 6.62518V3.76804H3.5V6.62518H4.5Z"
        fill="#D9D9D9"
      />
    </Svg>
  );
};

export default InfoIcon;
