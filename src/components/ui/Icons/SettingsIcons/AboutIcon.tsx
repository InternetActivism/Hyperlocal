import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const AboutIcon = () => {
    return (
        <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <Rect x="0" y="0.0288086" width="29.9424" height="29.9424" rx="8" fill="#454D45" />
            <Path
                fill="#A9B4A9"
                stroke="#A9B4A9"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.7404 23.5518C12.6438 22.2615 10.6935 20.7429 8.92413 19.0231C7.68021 17.7847 6.73323 16.2748 6.15572 14.6093C5.11647 11.3783 6.33038 7.67948 9.72758 6.58484C11.513 6.01006 13.463 6.33857 14.9675 7.46762C16.4725 6.33995 18.4218 6.01155 20.2074 6.58484C23.6046 7.67948 24.8272 11.3783 23.7879 14.6093C23.2104 16.2748 22.2635 17.7847 21.0195 19.0231C19.2502 20.7429 17.2998 22.2615 15.2033 23.5518L14.9762 23.693L14.7404 23.5518Z"
            />
            <Path
                stroke="#A9B4A9"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18.583 10.2219C19.612 10.5506 20.3431 11.4744 20.4344 12.5613"
            />
        </Svg>
    );
};

export default AboutIcon;
