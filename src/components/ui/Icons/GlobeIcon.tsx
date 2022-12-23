import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

const GlobeIcon = () => (
  <Svg width={63} height={62} fill="none">
    <G clipPath="url(#a)" stroke="#00D212">
      <Path
        d="M31.474 2.679c-7.621.038-14.916 3.049-20.285 8.371-5.368 5.323-8.372 12.524-8.353 20.022.02 7.499 3.061 14.684 8.458 19.98 5.396 5.295 12.706 8.27 20.328 8.27s14.932-2.975 20.328-8.27c5.397-5.296 8.438-12.481 8.458-19.98.02-7.498-2.985-14.699-8.353-20.021C46.686 5.727 39.39 2.716 31.77 2.678h-.296Z"
        strokeWidth={4.43}
      />
      <Path
        d="M31.622 2.679V59.32M60.408 31H2.836m6.496-17.429a38.812 38.812 0 0 0 22.29 7.022 38.812 38.812 0 0 0 22.29-7.022m0 34.858a38.812 38.812 0 0 0-22.29-7.022 38.812 38.812 0 0 0-22.29 7.022M29.408 3.405a36.381 36.381 0 0 0-9.66 12.447 35.82 35.82 0 0 0-3.433 15.293 35.819 35.819 0 0 0 3.433 15.293 36.38 36.38 0 0 0 9.66 12.448m4.428 0a36.382 36.382 0 0 0 9.66-12.448 35.819 35.819 0 0 0 3.434-15.293 35.82 35.82 0 0 0-3.433-15.293 36.383 36.383 0 0 0-9.66-12.447"
        strokeWidth={4.07}
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" transform="translate(.622 .5)" d="M0 0h62v61H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default GlobeIcon;
