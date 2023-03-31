import { Provider } from 'jotai';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import App from './App';
import { vars } from './utils/theme';

export default function AppWrapper() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider>
      <StatusBar barStyle="light-content" backgroundColor={vars.backgroundColor} />
      <App />
    </Provider>
  );
}
