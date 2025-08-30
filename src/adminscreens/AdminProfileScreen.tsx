import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const admin = {
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '9801234567',
    role: t('administrator'),  // Example i18n key
    profileImage: 'https://via.placeholder.com/150',
  };

  const handleLogout = async () => {
    await AsyncStorage.clear(); // clear session/storage
    Alert.alert(t('logout'), t('logoutSuccess'));
    navigation.dispatch(StackActions.replace('AdminLogin')); // adjust screen name accordingly
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: admin.profileImage }} style={styles.avatar} />
      <Text style={styles.name}>{admin.name}</Text>
      <Text style={styles.role}>{admin.role}</Text>

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
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    elevation: 2,
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
  },
  logoutBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
