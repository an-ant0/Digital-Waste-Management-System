import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Signup1: undefined;
  Signup2: {
    firstName: string;
    middleName: string;
    lastName: string;
    homeNumber: string;
    wardNumber: string;
    localityName: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup1'>;

const SignupScreen1: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [homeNumber, setHomeNumber] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [localityName, setLocalityName] = useState('');

  const handleNext = () => {
    if (!firstName || !lastName || !homeNumber || !wardNumber || !localityName) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }

    navigation.navigate('Signup2', {
      firstName,
      middleName,
      lastName,
      homeNumber,
      wardNumber,
      localityName,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Signup - Step 1</Text>

        {/* Name Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name *"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Middle Name"
            value={middleName}
            onChangeText={setMiddleName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name *"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Address Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Home Number *"
            keyboardType="number-pad"
            value={homeNumber}
            onChangeText={setHomeNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Ward Number *"
            keyboardType="number-pad"
            value={wardNumber}
            onChangeText={setWardNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Locality Name *"
            value={localityName}
            onChangeText={setLocalityName}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen1;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#555',
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nextButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
