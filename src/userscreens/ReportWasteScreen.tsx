// frontend/ReportWasteScreen.tsx
import React, { useState, useLayoutEffect, useEffect } from 'react';
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
  ActivityIndicator, // Add ActivityIndicator
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary, Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker'; // Added CameraOptions, ImageLibraryOptions
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To get userId
import { PermissionsAndroid } from 'react-native'; // Add PermissionsAndroid
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../config';

const wasteTypes = [
  'Household waste',
  'Street litter',
  'Overflowing bin',
  'Illegal dumping',
  'Construction waste',
  'Industrial waste',
  'Agricultural waste',
  'E-waste (electronic waste)',
  'Medical waste',
  'Hazardous waste',
  'Recyclables (paper, plastic, glass, metal)',
  'Organic waste (food scraps, yard waste)',
  'Other',
];

type ReportWasteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReportWaste'>;

interface WasteDetails {
  userId: string;
  wasteType: string;
  description: string;
  latitude: string;
  longitude: string;
  address: string;
  photo: Asset | null;
}

const ReportWasteScreen: React.FC = () => {
  const navigation = useNavigation<ReportWasteScreenNavigationProp>();
  const route = useRoute(); // Use useRoute to access route params
  const { t } = useTranslation();

  const [wasteDetails, setWasteDetails] = useState<WasteDetails>({
    userId: '',
    wasteType: wasteTypes[0], // Default to first type
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    photo: null,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('reportWaste.screenTitle'), // Using translation for title
      headerShown: true, // Ensure header is visible
    });
  }, [navigation, t]);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setWasteDetails(prev => ({ ...prev, userId: storedUserId }));
      } else {
        Alert.alert(t('common.error'), t('reportWaste.userIdError'));
        // Optionally navigate back to login or dashboard if userId is critical
      }
    };
    fetchUserId();
  }, []);

  // Request location permission function
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        console.log('iOS location permission granted');
        return true;
      } else {
        Alert.alert(
          t('reportWaste.locationPermissionDenied'),
          t('reportWaste.enableLocationSettings')
        );
        return false;
      }
    }

    // For Android
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (hasPermission) {
      console.log('Android location permission already granted');
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: t('reportWaste.permissionTitle'),
        message: t('reportWaste.permissionMessage'),
        buttonNeutral: t('common.askMeLater'),
        buttonNegative: t('common.cancel'),
        buttonPositive: t('common.ok'),
      },
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Android location permission granted');
      return true;
    } else if (status === PermissionsAndroid.RESULTS.DENIED) {
      console.log('Android location permission denied');
      Alert.alert(
        t('reportWaste.locationPermissionDenied'),
        t('reportWaste.cannotGetLocation')
      );
      return false;
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log('Android location permission denied with "Never Ask Again"');
      Alert.alert(
        t('reportWaste.locationPermissionDenied'),
        t('reportWaste.enableManuallySettings')
      );
      return false;
    }
    return false;
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setWasteDetails(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
            console.log(`Current Location: ${latitude}, ${longitude}`);
          },
          (error) => {
            Alert.alert(t('common.locationError'), error.message);
            console.error('Geolocation Error:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    } catch (err) {
      console.warn(err);
      Alert.alert(t('common.error'), t('reportWaste.permissionRequestFailed'));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleChoosePhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.7,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode, response.errorMessage);
        Alert.alert(t('common.error'), response.errorMessage || t('reportWaste.photoSelectionFailed'));
      } else if (response.assets && response.assets.length > 0) {
        setWasteDetails(prev => ({ ...prev, photo: response.assets![0] }));
      }
    });
  };

  const handleCapturePhoto = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.7,
      includeBase64: false,
      saveToPhotos: true, // Save captured photo to gallery
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorCode, response.errorMessage);
        Alert.alert(t('common.error'), response.errorMessage || t('reportWaste.photoCaptureFailed'));
      } else if (response.assets && response.assets.length > 0) {
        setWasteDetails(prev => ({ ...prev, photo: response.assets![0] }));
      }
    });
  };

  const handleSubmitReport = async () => {
    if (!wasteDetails.wasteType || !wasteDetails.description || !wasteDetails.latitude || !wasteDetails.longitude || !wasteDetails.address || !wasteDetails.photo) {
      Alert.alert(t('common.error'), t('reportWaste.allFieldsRequired'));
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('userId', wasteDetails.userId);
    formData.append('wasteType', wasteDetails.wasteType);
    formData.append('description', wasteDetails.description);
    formData.append('latitude', wasteDetails.latitude);
    formData.append('longitude', wasteDetails.longitude);
    formData.append('address', wasteDetails.address);

    if (wasteDetails.photo) {
      const uriParts = wasteDetails.photo.uri!.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('photo', {
        uri: wasteDetails.photo.uri,
        name: `photo.${fileType}`,
        type: wasteDetails.photo.type || `image/${fileType}`, // Fallback type
      } as any); // Type assertion needed for FormData.append with file
    }

    try {
      const response = await fetch(`${API_URL}/api/waste/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('reportWaste.submissionFailed'));
      }

      Alert.alert(t('common.success'), t('reportWaste.reportSubmittedSuccess'));
      // Clear form or navigate
      setWasteDetails({
        userId: wasteDetails.userId, // Keep userId
        wasteType: wasteTypes[0],
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        photo: null,
      });
      navigation.goBack(); // Navigate back to previous screen
    } catch (error: any) {
      console.error('Error submitting waste report:', error);
      Alert.alert(t('common.error'), error.message || t('reportWaste.submissionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust as needed
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>{t('reportWaste.wasteType')}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={wasteDetails.wasteType}
            onValueChange={(itemValue) => setWasteDetails(prev => ({ ...prev, wasteType: itemValue }))}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {wasteTypes.map((type, index) => (
              <Picker.Item key={index} label={t(`wasteTypes.${type.replace(/\s/g, '').toLowerCase()}`)} value={type} />
            ))}
          </Picker>
        </View>

        <Text style={styles.sectionTitle}>{t('reportWaste.description')}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={t('reportWaste.descriptionPlaceholder')}
          multiline
          numberOfLines={4}
          value={wasteDetails.description}
          onChangeText={(text) => setWasteDetails(prev => ({ ...prev, description: text }))}
        />

        <Text style={styles.sectionTitle}>{t('reportWaste.locationDetails')}</Text>
        <View style={styles.locationInputGroup}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder={t('reportWaste.latitudePlaceholder')}
            keyboardType="numeric"
            value={wasteDetails.latitude}
            onChangeText={(text) => setWasteDetails(prev => ({ ...prev, latitude: text }))}
          />
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder={t('reportWaste.longitudePlaceholder')}
            keyboardType="numeric"
            value={wasteDetails.longitude}
            onChangeText={(text) => setWasteDetails(prev => ({ ...prev, longitude: text }))}
          />
        </View>

        <TouchableOpacity
          style={styles.useCurrentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.useCurrentLocationButtonText}>
              <Icon name="my-location" size={18} color="#fff" /> {t('reportWaste.useCurrentLocation')}
            </Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t('reportWaste.addressPlaceholder')}
          value={wasteDetails.address}
          onChangeText={(text) => setWasteDetails(prev => ({ ...prev, address: text }))}
        />

        <Text style={styles.sectionTitle}>{t('reportWaste.uploadPhoto')}</Text>
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={handleCapturePhoto}>
            <Text style={styles.photoButtonText}>
              <Icon name="camera-alt" size={18} color="#fff" /> {t('reportWaste.capturePhoto')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
            <Text style={styles.photoButtonText}>
              <Icon name="photo-library" size={18} color="#fff" /> {t('reportWaste.chooseFromGallery')}
            </Text>
          </TouchableOpacity>
        </View>

        {wasteDetails.photo ? (
          <Image source={{ uri: wasteDetails.photo.uri }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Icon name="image" size={50} color="#777" />
            <Text style={styles.photoPlaceholderText}>{t('reportWaste.noPhotoSelected')}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('reportWaste.submitReport')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    textAlignVertical: 'top',
  },
  locationInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationInput: {
    flex: 0.48,
    marginBottom: 0, // Override default margin
  },
  useCurrentLocationButton: {
    backgroundColor: '#28a745', // Green color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  useCurrentLocationButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 5,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoButton: {
    backgroundColor: '#1E90FF', // DodgerBlue
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
    resizeMode: 'cover',
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  photoPlaceholderText: {
    color: '#777',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007bff', // Blue color
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30, // Extra space at the bottom
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ReportWasteScreen;