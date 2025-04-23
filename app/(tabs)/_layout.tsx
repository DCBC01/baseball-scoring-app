import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Settings, User, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Svg, { Circle, Path } from 'react-native-svg';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.gray[200],
        },
        headerStyle: {
          backgroundColor: Colors.card,
        },
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size }) => (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="12" cy="12" r="10" />
              <Path d="M5.5 5.5 18.5 18.5" />
              <Path d="M18.5 5.5 5.5 18.5" />
            </Svg>
          ),
        }}
      />
      
      <Tabs.Screen
        name="players"
        options={{
          title: 'Players',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      
      {/* Hide the admin tab - it's now accessible from settings */}
      <Tabs.Screen
        name="admin"
        options={{
          href: null, // This hides the tab
        }}
      />
      
      {/* Hide the leaderboard tab - it's now in settings */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null, // This hides the tab
        }}
      />
    </Tabs>
  );
}