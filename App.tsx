import React from 'react';
import 'react-native-reanimated';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/navigation/types';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './src/screens/SplashScreen';
import LanguageSelection from './src/screens/LanguageSelection';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignupScreen1 from './src/screens/Auth/SignupScreen1';
import SignupScreen2 from './src/screens/Auth/SignupScreen2';
import SignupScreen3 from './src/screens/Auth/SignupScreen3';
import SignupScreen4 from './src/screens/Auth/SignupScreen4';
import HomeScreen from './src/screens/HomeScreen';
import ReportWaste from './src/screens/ReportWasteScreen';
import CustomPickupScreen from './src/screens/CustomPickupScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SupportScreen from './src/screens/SupportScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RewardHistoryScreen from './src/screens/RewardHistoryScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Report Waste" component={ReportWaste} />
      <Drawer.Screen name="Custom Pickup" component={CustomPickupScreen} />
      <Drawer.Screen name="Rewards" component={RewardsScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup1" component={SignupScreen1} />
          <Stack.Screen name="Signup2" component={SignupScreen2} />
          <Stack.Screen name="Signup3" component={SignupScreen3} />
          <Stack.Screen name="Signup4" component={SignupScreen4} />
          <Stack.Screen name="Home" component={DrawerRoutes}  />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true}} />
          <Stack.Screen name="RewardHistory" component={RewardHistoryScreen} options={{ headerShown: true}} />
          <Stack.Screen name="ReportWaste" component={ReportWaste} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true}} />
          <Stack.Screen name="CustomPickup" component={CustomPickupScreen} />
          <Stack.Screen name="Badges" component={BadgesScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
