import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OptionScreen } from '../screens/OptionScreen';
import { NetworkCablingSetupScreen } from '../screens/NetworkCablingSetupScreen';
import { HelpGuide } from '../screens/HelpGuide';
import { ARScreen } from '../screens/ARScreen';
import { ARNetworkScreen } from '../screens/ARNetworkScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: '#081f42' },
  headerTintColor: '#f1f5f9',
  headerTitleStyle: { fontWeight: '700' },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          ...headerOptions,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Options"
          component={OptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NetworkCablingSetup"
          component={NetworkCablingSetupScreen}
          options={{ title: 'Network Cabling', headerShown: true }}
        />
        <Stack.Screen
          name="HelpGuide"
          component={HelpGuide}
          options={{ title: 'Help / Guide', headerShown: true }}
        />
        <Stack.Screen
          name="AR"
          component={ARScreen}
          options={{
            title: 'Hardware AR',
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ARNetwork"
          component={ARNetworkScreen}
          options={{
            title: 'Network Cabling AR',
            headerShown: false,
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
