import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DiscoveryStack from './DiscoveryStack';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Découverte" component={DiscoveryStack} />
        <Tab.Screen name="Carte" component={MapScreen} />
        <Tab.Screen name="Mon Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}