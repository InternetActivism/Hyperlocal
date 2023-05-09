import { Provider } from 'jotai';
import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import App from './App';
import { vars } from './utils/theme';

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

export default function AppWrapper() {
  return (
    <Provider>
      <StatusBar barStyle="light-content" backgroundColor={vars.backgroundColor} />
      <App />
    </Provider>
  );
}
