import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup2'>;

const SignupScreen2: React.FC<Props> = ({ navigation, route }) => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [idType, setIdType] = useState<string>('');
  const [idNumber, setIdNumber] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);

  const handleSelectImage = async (setter: (data: string | null) => void) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.5,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        const type = asset.type || 'image/jpeg';
        setter(`data:${type};base64,${asset.base64}`);
      } else {
        Alert.alert('Error', 'Failed to get base64 data for image.');
        setter(null);
      }
    }
  };

  const handleNext = () => {
    if (
      !profilePic ||
      !idType.trim() ||
      !idNumber.trim() ||
      !idPhoto
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    navigation.navigate('Signup3', {
      ...route.params,
      profilePic,
      idType: idType.trim(),
      idNumber: idNumber.trim(),
      idPhoto,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Signup - Step 2</Text>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Upload Profile Picture</Text>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleSelectImage(setProfilePic)}
          >
            <Text style={styles.imageButtonText}>Choose Profile Picture</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Identity Information</Text>

        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Type of Identification</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={idType}
              onValueChange={setIdType}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label="Select ID Type..." value="" enabled={false} />
              <Picker.Item label="Citizenship" value="Citizenship" />
              <Picker.Item label="Passport" value="Passport" />
              <Picker.Item label="Voter ID" value="VoterID" />
            </Picker>
          </View>
        </View>

        {idPhoto ? (
          <Image source={{ uri: idPhoto }} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleSelectImage(setIdPhoto)}
          >
            <Text style={styles.imageButtonText}>Upload ID Photo</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="Identification Number"
          value={idNumber}
          keyboardType="number-pad"
          onChangeText={setIdNumber}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen2;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#555',
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#444',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nextButton: {
    backgroundColor: '#28a745',
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
