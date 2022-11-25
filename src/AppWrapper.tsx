import React from 'react';
import { Provider } from 'jotai';
import App from './App';

export default function AppWrapper() {
  return (
    <Provider>
      <App />
    </Provider>
  );
}
