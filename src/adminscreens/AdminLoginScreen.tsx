// frontend/AdminProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  role: 'user' | 'admin';
}

const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        // In a real app, you would get the userId from a secure storage like AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found.');
        }

        const response = await axios.get<User>(`${API_URL}/api/users/profile/${userId}`);
        setAdmin(response.data);
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert(t('logout'), t('logoutSuccess'));
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AdminLogin' }],
      })
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !admin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Admin profile data is missing.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: admin.profilePic || 'https://via.placeholder.com/150' }} style={styles.avatar} />
      <Text style={styles.name}>{`${admin.firstName} ${admin.lastName}`}</Text>
      <Text style={styles.role}>{t('administrator')}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>{t('email')}</Text>
        <Text style={styles.value}>{admin.email}</Text>

        <Text style={styles.label}>{t('phone')}</Text>
        <Text style={styles.value}>{admin.phone}</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        accessibilityLabel={t('logout')}
      >
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 30,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  role: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  logoutBtn: {
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});