import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importando as Telas
import ProductsScreen from './src/screens/ProductsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import MyListScreen from './src/screens/MyListScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Minha Lista') {
                iconName = focused ? 'cart' : 'cart-outline';
              } else if (route.name === 'Mercado') {
                iconName = focused ? 'store' : 'store-outline';
              } else if (route.name === 'Favoritos') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Histórico') {
                iconName = focused ? 'history' : 'history';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1B5E20',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#FFF',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#1B5E20',
            },
          })}
        >
          <Tab.Screen name="Mercado" component={ProductsScreen} />
          <Tab.Screen name="Favoritos" component={FavoritesScreen} />
          <Tab.Screen name="Minha Lista" component={MyListScreen} />
          <Tab.Screen name="Histórico" component={HistoryScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
