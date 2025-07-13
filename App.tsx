import React from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { useTranslation } from 'react-i18next';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from './src/navigation/types';

import SplashScreen from './src/userscreens/SplashScreen';
import LanguageSelection from './src/userscreens/LanguageSelection';
import SelectionScreen from './src/common/SelectionScreen';
import AdminLogin from './src/adminscreens/LoginScreen';
import UserLogin from './src/userscreens/Auth/LoginScreen';
import SignupScreen1 from './src/userscreens/Auth/SignupScreen1';
import SignupScreen2 from './src/userscreens/Auth/SignupScreen2';
import SignupScreen3 from './src/userscreens/Auth/SignupScreen3';
import SignupScreen4 from './src/userscreens/Auth/SignupScreen4';
import HomeScreen from './src/userscreens/HomeScreen';
import AdminDashboard from './src/adminscreens/AdminDashboard';
import ManageUsersScreen from './src/adminscreens/ManageUsersScreen';
import ReportWaste from './src/userscreens/ReportWasteScreen';
import CustomPickupScreen from './src/userscreens/CustomPickupScreen';
import RewardsScreen from './src/userscreens/RewardsScreen';
import HistoryScreen from './src/userscreens/ReportHistoryScreen';
import SupportScreen from './src/userscreens/SupportScreen';
import FeedbackScreen from './src/userscreens/FeedbackScreen';
import ProfileScreen from './src/userscreens/ProfileScreen';
import RewardHistoryScreen from './src/userscreens/RewardHistoryScreen';
import BadgesScreen from './src/userscreens/BadgesScreen';
import LeaderboardScreen from './src/userscreens/LeaderboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function DrawerRoutes({ role }: { role: 'admin' | 'user' }) {
  const { t } = useTranslation();

  if (role === 'admin') {
    return (
      <Drawer.Navigator initialRouteName="AdminDashboard">
        <Drawer.Screen
          name="Admin Dashboard"
          component={AdminDashboard}
          options={{ drawerLabel: t('Dashboard') }}
        />
        <Drawer.Screen
          name="Manage Users"
          component={ManageUsersScreen}
          options={{ drawerLabel: t('Manage Users') }}
        />
      </Drawer.Navigator>
    );
  }

  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerLabel: t('home') }} />
      <Drawer.Screen name="ReportWaste" component={ReportWaste} options={{ drawerLabel: t('reportWaste') }} />
      <Drawer.Screen name="CustomPickup" component={CustomPickupScreen} options={{ drawerLabel: t('customPickup') }} />
      <Drawer.Screen name="Rewards" component={RewardsScreen} options={{ drawerLabel: t('rewards') }} />
      <Drawer.Screen name="Support" component={SupportScreen} options={{ drawerLabel: t('support') }} />
    </Drawer.Navigator>
  );
}

const DrawerRoutesWrapper = ({ route }: any) => {
  const role = route?.params?.role || 'user';
  return <DrawerRoutes role={role} />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
            <Stack.Screen name="Selection" component={SelectionScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLogin} />
            <Stack.Screen name="UserLogin" component={UserLogin} />
            <Stack.Screen name="Signup1" component={SignupScreen1} />
            <Stack.Screen name="Signup2" component={SignupScreen2} />
            <Stack.Screen name="Signup3" component={SignupScreen3} />
            <Stack.Screen name="Signup4" component={SignupScreen4} />
            <Stack.Screen name="Home" component={DrawerRoutesWrapper} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }} />
            <Stack.Screen name="RewardHistory" component={RewardHistoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ReportWaste" component={ReportWaste} />
            <Stack.Screen name="ReportHistory" component={HistoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="CustomPickup" component={CustomPickupScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
