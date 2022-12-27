import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

const ChevronLeftIcon = () => {
  return (
    <Svg width={12} height={17} fill="none">
      <G clipPath="url(#a)" fill="#A4A4A4">
        <Path d="m1.906 8.74 7.421 7.06 1.746-1.662-5.68-5.402 5.68-5.403-1.746-1.651-7.42 7.058Z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M.99 8.74c0 .262.106.513.293.69l7.421 7.06a.9.9 0 0 0 1.246 0l1.746-1.661a.953.953 0 0 0 .294-.69.953.953 0 0 0-.294-.691L6.742 8.736l4.954-4.713a.953.953 0 0 0 .294-.692.953.953 0 0 0-.296-.69L9.948.989a.9.9 0 0 0-1.244.002L1.284 8.05a.953.953 0 0 0-.294.69Zm4.403-.004 5.68 5.402L9.327 15.8 1.907 8.74l7.42-7.059 1.746 1.652-5.68 5.403Z"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" transform="matrix(-1 0 0 1 11.99 .74)" d="M0 0h11v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default ChevronLeftIcon;
