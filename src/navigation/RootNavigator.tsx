import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import WalletScreen from '../screens/WalletScreen';
import AuthScreen from '../screens/AuthScreen';
import { colors } from '../theme/colors';
import { Platform, View, ActivityIndicator } from 'react-native';

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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <NavigationContainer theme={DarkNeonTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </NavigationContainer>
    );
  }

  if (!user) {
    return (
      <NavigationContainer theme={DarkNeonTheme}>
        <AuthScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={DarkNeonTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.select({ ios: 88, android: 70 }),
            paddingTop: 12,
            paddingBottom: Platform.select({ ios: 28, android: 12 }),
          },
          tabBarIcon: ({ focused }) => {
            let icon: any = 'home';
            if (route.name === 'Home') icon = focused ? 'home' : 'home-outline';
            if (route.name === 'Friends') icon = focused ? 'people' : 'people-outline';
            if (route.name === 'Leaderboard') icon = focused ? 'podium' : 'podium-outline';
            if (route.name === 'Wallet') icon = focused ? 'wallet' : 'wallet-outline';
            
            return (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
              }}>
                <Ionicons 
                  name={icon} 
                  size={24} 
                  color={focused ? colors.primary : colors.textMuted} 
                />
                {focused && (
                  <View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                    marginTop: 4,
                  }} />
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
