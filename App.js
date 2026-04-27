import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native'; // <-- Adicione esta importação

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
              paddingTop: 5,
              // Usamos paddingBottom dinâmico dependendo do sistema para evitar 
              // que os ícones fiquem colados na borda no Android
              paddingBottom: Platform.OS === 'android' ? 5 : 0, 
              minHeight: 60, // <-- Substitua 'height' por 'minHeight'
            },
            headerStyle: {
              backgroundColor: '#FFF',
            },
            headerTitleAlign: 'center',
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