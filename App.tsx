import React from 'react';
import { Provider } from 'jotai';

import { SamplePage } from './src/scenes';

export default function App() {
  return (
    <Provider>
      <SamplePage />
    </Provider>
  );
}
