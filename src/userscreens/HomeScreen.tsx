import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

// Define the type for the Home screen's route props
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  // --- THIS IS THE CORRECT PLACE FOR THE DEBUG LOG ---
  // It should be inside the functional component, but BEFORE the return statement (JSX)
  console.log('HomeScreen route params:', route.params);
  // --- END DEBUG LOG ---

  // Ensure route.params is not undefined before destructuring
  // This helps prevent the "Cannot read property 'userId' of undefined" if params are truly missing
  const userId = route.params?.userId;
  const role = route.params?.role;

  // Set header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Home',
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => {
            // Ensure userId exists before navigating
            if (userId) {
              navigation.navigate('Profile', { userId: userId });
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
          onPress={() =>
            Alert.alert(
              'Logout',
              'Are you sure you want to log out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'UserLogin' }],
                    });
                  },
                },
              ]
            )
          }
        >
          <Ionicons name="log-out-outline" size={28} color="#dc3545" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userId]); // Add userId to dependencies

  // Handle case where userId might still be undefined (e.g., direct navigation without params)
  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: User data not loaded. Please log in again.</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] })}
        >
          <Text style={styles.logoutButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Welcome, User!</Text>
        <Text style={styles.userIdText}>Your User ID: {userId}</Text>
        <Text style={styles.roleText}>Your Role: {role || 'N/A'}</Text> {/* Display role, default to N/A */}

        <Card title="Waste Reported" value="12" description="Reports you’ve submitted" />
        <Card title="Verified Reported" value="9" description="Reports verified by authority" />
        <Card title="Points Available" value="340" description="Your reward points" />
        <Card title="Redeemed Points" value="120" description="Points you’ve used" />
        <Card title="Current Report Status" value="On Process" description="Latest report status" />
        <Card title="Level / Badges" value="Silver" description="Your achievement level" />
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

// Styles
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
