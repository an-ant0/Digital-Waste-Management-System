import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/i18n';
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
import AdminWasteReviewScreen from './src/adminscreens/AdminWasteReviewScreen';
import AdminWasteHistoryScreen from './src/adminscreens/AdminWasteHistoryScreen';
import CustomPickupScreen from './src/userscreens/CustomPickupScreen';
import AdminCustomPickupScreen from './src/adminscreens/AdminCustomPickupScreen';
import TruckManagementScreen from './src/adminscreens/TruckManagementScreen';
import TruckLocationScreen from './src/adminscreens/TruckLocationScreen';
import RewardsScreen from './src/userscreens/RewardsScreen';
import PointsRedemptionScreen from './src/adminscreens/PointsRedemptionScreen';
import HistoryScreen from './src/userscreens/ReportHistoryScreen';
import SupportScreen from './src/userscreens/SupportScreen';
import FeedbackScreen from './src/userscreens/FeedbackScreen';
import ProfileScreen from './src/userscreens/ProfileScreen';
import AdminProfileScreen from './src/adminscreens/AdminProfileScreen';
import RewardHistoryScreen from './src/userscreens/RewardHistoryScreen';
import BadgesScreen from './src/userscreens/BadgesScreen';
import LeaderboardScreen from './src/userscreens/LeaderboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function DrawerRoutes({
  role,
  initialParams,
}: {
  role: 'admin' | 'user';
  initialParams?: any;
}) {
  const { t } = useTranslation();

  if (role === 'admin') {
    return (
      <Drawer.Navigator initialRouteName="AdminDashboard">
        <Drawer.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ drawerLabel: t('Dashboard') }}
        />
        <Drawer.Screen
          name="ManageUsers"
          component={ManageUsersScreen}
          options={{ drawerLabel: t('Manage Users') }}
        />
        <Drawer.Screen
          name="AdminWasteReview"
          component={AdminWasteReviewScreen}
          options={{ drawerLabel: t('Waste Review') }}
        />
        <Drawer.Screen
          name="TruckManagement"
          component={TruckManagementScreen}
          options={{ drawerLabel: t('Truck Management') }}
        />
        <Drawer.Screen
          name="TruckLocation"
          component={TruckLocationScreen}
          options={{ drawerLabel: t('Truck Location') }}
        />
        <Drawer.Screen
          name="PointsRedemption"
          component={PointsRedemptionScreen}
          options={{ drawerLabel: t('Points Redemption') }}
        />
        <Drawer.Screen
          name="AdminCustomPickup"
          component={AdminCustomPickupScreen}
          options={{ drawerLabel: t('Custom Pickup Requests') }}
        />
         <Drawer.Screen
          name="AdminProfile"
          component={AdminProfileScreen}
          options={{ drawerLabel: t('Profile') }}
        />
        <Drawer.Screen
          name="AdminWasteHistory"
          component={AdminWasteHistoryScreen}
          options={{ drawerLabel: t('Waste History') }}
        />
      </Drawer.Navigator>
    );
  }

  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        initialParams={initialParams}
        options={{ drawerLabel: t('Home') }}
      />
      <Drawer.Screen
        name="ReportWaste"
        component={ReportWaste}
        options={{ drawerLabel: t('Report Waste') }}
      />
      <Drawer.Screen
        name="CustomPickup"
        component={CustomPickupScreen}
        options={{ drawerLabel: t('Custom Pickup') }}
      />
      <Drawer.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ drawerLabel: t('Rewards') }}
      />
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{ drawerLabel: t('Support') }}
      />
    </Drawer.Navigator>
  );
}

type DrawerWrapperProps = {
  route: RouteProp<RootStackParamList, 'Home'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const DrawerRoutesWrapper: React.FC<DrawerWrapperProps> = ({ route }) => {
  const { role = 'user', userId = '', userName = '' } = route.params || {};
  return (
    <DrawerRoutes
      role={role}
      initialParams={{ userId, role, userName }}
    />
  );
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
            <Stack.Screen name="AdminProfile" component={AdminProfileScreen} options={{ headerShown: true }} />
            <Stack.Screen name="RewardHistory" component={RewardHistoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="PointsRedemption" component={PointsRedemptionScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ReportWaste" component={ReportWaste} />
            <Stack.Screen name="AdminWasteReview" component={AdminWasteReviewScreen} options={{ headerShown: true }} />
            <Stack.Screen name="AdminWasteHistory" component={AdminWasteHistoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ReportHistory" component={HistoryScreen} options={{ headerShown: true }} />
            <Stack.Screen name="CustomPickup" component={CustomPickupScreen} />
            <Stack.Screen name="AdminCustomPickup" component={AdminCustomPickupScreen} options={{ headerShown: true }} />
            <Stack.Screen name="TruckManagement" component={TruckManagementScreen} /> 
            <Stack.Screen name="TruckLocation" component={TruckLocationScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}