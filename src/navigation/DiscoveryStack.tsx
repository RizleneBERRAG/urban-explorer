import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DiscoveryScreen from '../screens/DiscoveryScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';

const Stack = createNativeStackNavigator();

export default function DiscoveryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListeLieux"
        component={DiscoveryScreen}
        options={{ title: 'Découverte' }}
      />
      <Stack.Screen
        name="DetailLieu"
        component={PlaceDetailScreen}
        options={{ title: 'Détail du lieu' }}
      />
    </Stack.Navigator>
  );
}