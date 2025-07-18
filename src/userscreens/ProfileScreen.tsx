// frontend/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
// IMPORTANT: Add this import for launchImageLibrary
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; // adjust path if needed

// Define the type for the route props, now expecting userId
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { userId } = route.params; // Get userId from route params

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [homeNumber, setHomeNumber] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [localityName, setLocalityName] = useState(''); // Changed from 'locality' to match backend
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading state for data fetch
  const [saving, setSaving] = useState(false); // State for save operation
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

  // IMPORTANT: Use your computer's actual local IP address
  const API_BASE_URL = 'http://192.168.1.76:5000/api/users';

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setProfilePic(data.profilePic || null);
        setFirstName(data.firstName || '');
        setMiddleName(data.middleName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setHomeNumber(data.homeNumber || '');
        setWardNumber(data.wardNumber || '');
        setLocalityName(data.localityName || '');
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch profile data.');
        console.error('Backend Fetch Error:', data);
      }
    } catch (error) {
      console.error('Network or other error during profile fetch:', error);
      Alert.alert('Error', 'Could not load profile. Check network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]); // Dependency array includes userId

  useEffect(() => {
    if (userId) { // Only fetch if userId is available
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]); // Re-fetch if userId changes or fetchUserProfile memoized function changes

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.5, // Reduce quality for base64
      includeBase64: true, // Request base64 data
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Image selection failed.');
      return;
    }
    const uri = result.assets?.[0]?.uri;
    const base64Data = result.assets?.[0]?.base64;

    if (uri && base64Data) {
      setProfilePic(`data:${result.assets?.[0]?.type};base64,${base64Data}`);
    } else {
      Alert.alert('Error', 'Failed to get image data.');
    }
  };

  const validatePhone = (num: string) => /^9\d{9}$/.test(num);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Invalid phone number', 'Phone number must start with 9 and be 10 digits long.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid email address');
      return;
    }

    setSaving(true); // Start saving indicator

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you'd send a JWT token here: 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          homeNumber,
          wardNumber,
          localityName,
          profilePic, // Send base64 string
          phone,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Saved', data.message || 'Profile updated successfully.');
        setIsEditing(false); // Exit editing mode
        fetchUserProfile(); // Re-fetch to ensure UI is in sync with DB
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile.');
        console.error('Backend Update Error:', data);
      }
    } catch (error) {
      console.error('Network or other error during profile update:', error);
      Alert.alert('Error', 'Could not update profile. Check network connection.');
    } finally {
      setSaving(false); // Stop saving indicator
    }
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been logged out.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserLogin' }], // Changed to 'UserLogin' to match your RootStackParamList
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchUserProfile} />
      }
    >
      <TouchableOpacity onPress={isEditing ? handleChoosePhoto : undefined} disabled={!isEditing}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require('../../assets/default-profile.png') // Ensure this path is correct or provide a placeholder
          }
          style={styles.profileImage}
        />
        {isEditing && <Text style={styles.editText}>Edit Profile Picture</Text>}
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          editable={isEditing}
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Middle Name</Text>
        <TextInput
          editable={isEditing}
          value={middleName}
          onChangeText={setMiddleName}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          editable={isEditing}
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          editable={isEditing}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          editable={isEditing}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Home Number</Text>
        <TextInput
          editable={isEditing}
          value={homeNumber}
          onChangeText={setHomeNumber}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Ward Number</Text>
        <TextInput
          editable={isEditing}
          value={wardNumber}
          onChangeText={setWardNumber}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Locality Name</Text>
        <TextInput
          editable={isEditing}
          value={localityName}
          onChangeText={setLocalityName}
          style={styles.input}
        />
      </View>


      {isEditing ? (
        <TouchableOpacity
          style={[styles.saveButton, { opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 8,
  },
  editText: {
    textAlign: 'center',
    color: '#007BFF',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
