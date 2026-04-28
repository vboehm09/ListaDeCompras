import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import ProductsScreen from './src/screens/ProductsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import MyListScreen from './src/screens/MyListScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SharedListScreen from './src/screens/SharedListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
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
          paddingTop: 5,
          paddingBottom: Platform.OS === 'android' ? 5 : 0,
          minHeight: 60,
        },
        headerStyle: { backgroundColor: '#FFF' },
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold', color: '#1B5E20' },
      })}
    >
      <Tab.Screen name="Mercado" component={ProductsScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Minha Lista" component={MyListScreen} />
      <Tab.Screen name="Histórico" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SharedList"
            component={SharedListScreen}
            options={{
              title: 'Lista de Compras',
              headerTitleAlign: 'center',
              headerTintColor: '#1B5E20'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}