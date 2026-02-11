import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { DailyMissionsScreen } from '../screens/DailyMissionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { Platform } from 'react-native';

export type MainTabParamList = {
  Home: undefined;
  Challenges: undefined;
  Missions: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to stay above system UI
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 8);
  const tabBarHeight = Platform.OS === 'ios' 
    ? 60 + bottomPadding 
    : 60 + bottomPadding;

  const defaultTabBarStyle = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: tabBarHeight,
    paddingBottom: bottomPadding,
    paddingTop: 8,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Missions') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarStyle: defaultTabBarStyle,
        }}
      />
      <Tab.Screen 
        name="Challenges" 
        component={ChallengesScreen}
        options={{
          tabBarLabel: 'Challenges',
          tabBarStyle: defaultTabBarStyle,
        }}
      />
      <Tab.Screen 
        name="Missions"  
        component={DailyMissionsScreen}
        options={{
          tabBarLabel: 'Missions',
          tabBarStyle: defaultTabBarStyle,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarStyle: defaultTabBarStyle,
        }}
      />
    </Tab.Navigator>
  );
};
