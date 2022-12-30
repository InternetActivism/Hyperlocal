import React, { useEffect } from 'react';
import { Provider } from 'jotai';
import App from './App';
import SplashScreen from 'react-native-splash-screen';

export default function AppWrapper() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider>
      <App />
    </Provider>
  );
}
