import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';

const wasteTypes = [
  'Household waste',
  'Street litter',
  'Overflowing bin',
  'Illegal dumping',
  'Construction debris',
  'Medical/hazardous waste',
];

const ReportWasteScreen: React.FC = () => {
  const { t } = useTranslation(); // ✅ Declare this early
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ Set screen title and header icon
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('reportWaste'),
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('ReportHistory')} style={{ marginRight: 15 }}>
          <Icon name="history" size={28} color="#1E90FF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  const [wasteType, setWasteType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<Asset | null>(null);

  const useCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
      },
      error => {
        Alert.alert(t('locationError'), error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert(t('error'), response.errorMessage || t('unknownError'));
      } else if (response.assets?.length) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert(t('error'), response.errorMessage || t('unknownError'));
      } else if (response.assets?.length) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const handleSubmit = () => {
    if (!wasteType || !description.trim() || !location.trim() || !photo) {
      Alert.alert(t('validationError'), t('allFieldsRequired'));
      return;
    }

    Alert.alert(t('success'), t('reportSubmitted'));
    setWasteType('');
    setDescription('');
    setLocation('');
    setPhoto(null);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{t('reportWaste')}</Text>

        <Text style={styles.label}>{t('wasteType')} *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={wasteType}
            onValueChange={setWasteType}
            mode="dropdown"
            style={styles.picker}
          >
            <Picker.Item label={t('typeOfWaste')} value="" color="#999" />
            {wasteTypes.map(type => (
              <Picker.Item label={t(type)} value={type} key={type} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>{t('description')} *</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder={t('describeWaste')}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>{t('location')} *</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enterLocation')}
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
          <Text style={styles.locationButtonText}>{t('useCurrentLocation')}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t('photo')} *</Text>
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.photoButtonText}>{t('takePhoto')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>{t('chooseFromGallery')}</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('submitReport')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReportWasteScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoButton: {
    backgroundColor: '#1E90FF',
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  locationButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
