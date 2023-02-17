import { Provider } from 'jotai';
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import App from './App';

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
