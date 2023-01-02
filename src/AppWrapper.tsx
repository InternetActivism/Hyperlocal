import { Provider } from 'jotai';
import React from 'react';
import App from './App';

export default function AppWrapper() {
  return (
    <Provider>
      <App />
    </Provider>
  );
}
