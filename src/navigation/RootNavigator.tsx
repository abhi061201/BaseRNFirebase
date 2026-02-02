import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import SplashScreen from '@/screens/Splash';
import LoginScreen from '@/screens/Auth/Login/Login';
import SignupScreen from '@/screens/Auth/SignUp/Signup';
import HomeScreen from '@/screens/Home/HomeScreen';
import ProfileScreen from '@/screens/Profile';
import SettingsScreen from '@/screens/Settings';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: Platform.OS == 'android'? 'simple_push':'slide_from_right', 
        freezeOnBlur: true, // Freeze inactive screens to improve performance
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
