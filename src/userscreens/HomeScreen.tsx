import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack'; // Keep for other stack-related types if needed, but not for HomeScreenNavigationProp
import { DrawerNavigationProp } from '@react-navigation/drawer'; // This is correct and needed
import { RootStackParamList } from '../navigation/types';

// Define the type for the Home screen's route props (this was correct)
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

// CORRECTED: The navigation prop for HomeScreen is a DrawerNavigationProp,
// because HomeScreen is a direct child of the Drawer.Navigator.
type HomeScreenNavigationProp = DrawerNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  // Use the corrected type for the useNavigation hook
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  // Debug log for route params
  console.log('HomeScreen route params:', route.params);

  const userId = route.params?.userId;
  const role = route.params?.role;
  const userName = route.params?.userName;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Home',
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => {
            if (userId) {
              // This navigation.navigate is for the Stack Navigator, which is fine
              // because navigation is still implicitly capable of stack actions.
              navigation.navigate('Profile', { userId });
            } else {
              Alert.alert('Error', 'User ID not available for profile.');
            }
          }}
        >
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 16 }}
          onPress={() => {
            // CORRECTED: Now you can directly call openDrawer() on the 'navigation' object
            // because it is correctly typed as DrawerNavigationProp.
            navigation.openDrawer();
          }}
        >
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userId]);

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: User data not loaded. Please log in again.
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] })
          }
        >
          <Text style={styles.logoutButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Text style={styles.userIdText}>Your User ID: {userId}</Text>
        <Text style={styles.roleText}>Your Role: {role || 'N/A'}</Text>

        <Card title="Waste Reported" value="12" description="Reports you’ve submitted" />
        <Card
          title="Verified Reported"
          value="9"
          description="Reports verified by authority"
        />
        <Card title="Points Available" value="340" description="Your reward points" />

        <TouchableOpacity onPress={() => navigation.navigate('RedeemedPoints', { userId })}>
          <Card title="Redeemed Points" value="120" description="Points you’ve used" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Badges')}>
          <Card title="Level / Badges" value="Silver" description="Your achievement level" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

// Reusable Card Component
type CardProps = {
  title: string;
  value: string | number;
  description: string;
};

const Card: React.FC<CardProps> = ({ title, value, description }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardDesc}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});