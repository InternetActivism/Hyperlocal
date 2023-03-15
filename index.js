/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import AppWrapper from './src/AppWrapper';

AppRegistry.registerComponent(appName, () => AppWrapper);
