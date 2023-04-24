import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { vars } from '../../utils/theme';
import DeleteDataPage from './DeleteDataPage';
import ProfilePage from './SettingsPage';

export type SettingsStackParamList = {
  Profile: undefined;
  DeleteData: undefined;
};

const SettingsPageNavigator = () => {
  const Stack = createStackNavigator<SettingsStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: vars.backgroundColor,
        },
      }}
    >
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="DeleteData" component={DeleteDataPage} />
    </Stack.Navigator>
  );
};

export default SettingsPageNavigator;
