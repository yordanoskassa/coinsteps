import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import WalletScreen from '../screens/WalletScreen';
import { colors } from '../theme/colors';
import { Platform, View } from 'react-native';

const Tab = createBottomTabNavigator();

const DarkNeonTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: '#26284A',
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={DarkNeonTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: 'rgba(255,255,255,0.05)',
            position: 'absolute',
            marginHorizontal: 16,
            marginBottom: Platform.select({ ios: 24, android: 16 }),
            borderRadius: 20,
            height: 64,
            paddingBottom: 10,
          },
          tabBarIcon: ({ color, focused, size }) => {
            let icon: any = 'home';
            if (route.name === 'Home') icon = focused ? 'home' : 'home-outline';
            if (route.name === 'Challenges') icon = focused ? 'trophy' : 'trophy-outline';
            if (route.name === 'Leaderboard') icon = focused ? 'bar-chart' : 'bar-chart-outline';
            if (route.name === 'Wallet') icon = focused ? 'wallet' : 'wallet-outline';
            return (
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: focused ? 'rgba(124,92,255,0.15)' : 'transparent',
              }}>
                <Ionicons name={icon} size={26} color={focused ? colors.primary : colors.textMuted} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Challenges" component={ChallengesScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
