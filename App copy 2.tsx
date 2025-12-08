import * as React from 'react';
import { Text, View } from 'react-native';
import {
  useNavigation,
  NavigationContainer,
} from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import { Customer } from './source/screens/customer/customer';

function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Screen</Text>
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          position: 'absolute',
          //backgroundColor: 'turquoise',
          backgroundColor: 'rgba(64, 224, 208, 1)',
          margin: 20,
          borderRadius: 100,
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarInactiveTintColor: 'gray',
        tabBarActiveTintColor: 'black',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          }
          else if (route.name === 'Profile') {
            iconName = 'person-outline';
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        }
      })}>
      <Tab.Screen name='Home' component={Customer} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
