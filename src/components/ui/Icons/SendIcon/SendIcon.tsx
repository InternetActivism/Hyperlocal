import React from 'react';
import Svg, { Path } from 'react-native-svg';

function SendIcon(props: any) {
  return (
    <Svg width={24} height={23} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Path
        d="M11.7.979a2.223 2.223 0 0 0-1.979 1.16L.438 19.035a2.207 2.207 0 0 0 .112 2.362c.495.726 1.674 1.098 2.525.895l6.608-1.577a1.5 1.5 0 0 0 1.152-1.466l-.029-9.403a.844.844 0 0 1 .862-.862.877.877 0 0 1 .868.868l.022 9.41c.001.699.48 1.308 1.16 1.474l6.634 1.633a2.197 2.197 0 0 0 2.12-.58c.065-.066.138-.14.195-.212a2.242 2.242 0 0 0 .196-2.456L13.671 2.168A2.259 2.259 0 0 0 11.7.978Z"
        fill="#09F41D"
      />
    </Svg>
  );
}

export default SendIcon;
