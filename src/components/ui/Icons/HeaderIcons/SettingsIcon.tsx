import React from 'react';
import { Image } from 'react-native';

type Props = {
  height: number;
  width: number;
};

const SettingsIcon = ({ height, width }: Props) => {
  return (
    <Image
      source={require('../../../../assets/images/HeaderIcon7.png')}
      style={{ height: height, width: width }}
    />
  );
};

export default SettingsIcon;
