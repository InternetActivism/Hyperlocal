import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

const ChevronLeftIcon = () => (
  <Svg width={12} height={17} fill="none">
    <G clipPath="url(#a)" fill="#7B7B7B">
      <Path d="m.946 8.89 7.42 7.06 1.747-1.661-5.68-5.403 5.68-5.403-1.746-1.651-7.42 7.059Z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.03 8.89c0 .263.106.513.293.691l7.42 7.059a.9.9 0 0 0 1.247 0l1.746-1.66a.953.953 0 0 0 .293-.691.953.953 0 0 0-.293-.69L5.782 8.885l4.954-4.712a.953.953 0 0 0 .293-.692.953.953 0 0 0-.295-.691L8.988 1.14a.9.9 0 0 0-1.244.001L.323 8.201a.953.953 0 0 0-.294.69Zm4.403-.004 5.68 5.403-1.746 1.66L.946 8.892l7.42-7.06 1.747 1.652-5.68 5.403Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" transform="matrix(-1 0 0 1 11.03 .89)" d="M0 0h11v16H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default ChevronLeftIcon;
