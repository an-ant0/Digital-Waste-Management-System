import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; // adjust path if needed

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('user@example.com');
  const [houseNumber, setHouseNumber] = useState('123');
  const [wardNumber, setWardNumber] = useState('5');
  const [locality, setLocality] = useState('Kathmandu');
  const [isEditing, setIsEditing] = useState(false);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image selection failed.');
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setProfilePic(uri);
        }
      }
    );
  };

  const validatePhone = (num: string) => /^9\d{9}$/.test(num);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = () => {
    if (!validatePhone(phone)) {
      Alert.alert('Invalid phone number', 'Phone number must start with 9 and be 10 digits long.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid email address');
      return;
    }
    setIsEditing(false);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been logged out.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleChoosePhoto}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require('../../assets/default-profile.png')
          }
          style={styles.profileImage}
        />
        <Text style={styles.editText}>Edit Profile Picture</Text>
      </TouchableOpacity>

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
        <Text style={styles.label}>House Number</Text>
        <TextInput
          editable={isEditing}
          value={houseNumber}
          onChangeText={setHouseNumber}
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
        <Text style={styles.label}>Locality</Text>
        <TextInput
          editable={isEditing}
          value={locality}
          onChangeText={setLocality}
          style={styles.input}
        />
      </View>

      {isEditing ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
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
