import { Provider } from 'jotai';
import React from 'react';
import { StatusBar } from 'react-native';
import App from './App';
import { vars } from './utils/theme';

export default function AppWrapper() {
  return (
    <Provider>
      <StatusBar barStyle="light-content" backgroundColor={vars.backgroundColor} />
      <App />
    </Provider>
  );
}
