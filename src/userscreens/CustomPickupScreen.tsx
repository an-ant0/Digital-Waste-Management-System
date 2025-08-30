import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
  ActivityIndicator,
} from 'react-native'; // <-- CORRECTED THIS LINE
import DateTimePicker from '@react-native-community/datetimepicker';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

// TODO: Replace with your actual Google Maps API Key
// Ensure you have enabled Geocoding API in your Google Cloud Project
Geocoder.init('AIzaSyBzIm8HqhCLVeJdcNGh7S_BC1I_mv_SLlQ');


const SERVICE_FEE = 200;

// Define the type for the CustomPickup screen's route props
type CustomPickupScreenRouteProp = RouteProp<
  {
    CustomPickup: {
      userId?: string;
      userName?: string;
      userPhone?: string;
      userEmail?: string;
    };
  },
  'CustomPickup'
>;

const CustomPickupScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<CustomPickupScreenRouteProp>();

  const [address, setAddress] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For API call loading
  const [userDataLoading, setUserDataLoading] = useState(true); // For initial user data loading

  // State to hold user details for the request
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('customPickup') });
  }, [navigation, t]);

  // Effect to fetch user data from route params or AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      setUserDataLoading(true); // Start loading user data
      console.log('Fetching user data...');

      let fetchedUserId: string | null = null;
      let fetchedUserName: string | null = null;
      let fetchedUserPhone: string | null = null;
      let fetchedUserEmail: string | null = null;

      // Try to get from route params first
      if (route.params?.userId) {
        fetchedUserId = route.params.userId;
      }
      if (route.params?.userName) {
        fetchedUserName = route.params.userName;
      }
      if (route.params?.userPhone) {
        fetchedUserPhone = route.params.userPhone;
      }
      if (route.params?.userEmail) {
        fetchedUserEmail = route.params.userEmail;
      }

      // If not from route params, try AsyncStorage
      if (!fetchedUserId) {
        console.log('User ID not found in route params, checking AsyncStorage...');
        try {
          // AsyncStorage.getItem returns string | null, which is compatible
          fetchedUserId = (await AsyncStorage.getItem('userId'));
          fetchedUserName = (await AsyncStorage.getItem('userName'));
          fetchedUserPhone = (await AsyncStorage.getItem('userPhone'));
          fetchedUserEmail = (await AsyncStorage.getItem('userEmail'));
          console.log('User data from AsyncStorage:', { fetchedUserId, fetchedUserName, fetchedUserPhone, fetchedUserEmail });
        } catch (e) {
          console.error('Failed to load user data from AsyncStorage', e);
        }
      }

      // Ensure that any undefined values are converted to null for useState
      // The || null ensures that if fetched value is undefined, it becomes null.
      // If it's already null, it stays null. If it's a string, it stays a string.
      setUserId(fetchedUserId || null);
      setUserName(fetchedUserName || null);
      setUserPhone(fetchedUserPhone || null);
      setUserEmail(fetchedUserEmail || null);
      setUserDataLoading(false); // End loading user data
      console.log('Finished fetching user data. Current userId:', fetchedUserId);
    };
    fetchUserData();
  }, [route.params]); // Depend on route.params to re-fetch if they change

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: t('locationPermission'),
          message: t('locationPermissionMessage'),
          buttonNeutral: t('askMeLater'),
          buttonNegative: t('cancel'),
          buttonPositive: t('ok'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED; // Corrected RESULTS
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(t('locationPermissionDenied'), t('locationPermissionDeniedMessage'));
      return;
    }

    setLoading(true);
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const json = await Geocoder.from(position.coords.latitude, position.coords.longitude);
          const addressComponent = json.results[0].formatted_address;
          setAddress(addressComponent);
        } catch (error) {
          console.warn('Geocoder failed', error);
          Alert.alert(t('error'), t('failedToGetAddress'));
        } finally {
          setLoading(false);
        }
      },
      error => {
        console.warn(error.code, error.message);
        Alert.alert(t('error'), t('failedToGetLocation'));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleConfirmPickup = async () => {
    // Check if user data is still loading
    if (userDataLoading) {
      Alert.alert(t('error'), 'User data is still loading. Please wait.');
      return;
    }

    // Now, check if userId is actually available
    if (!userId) {
      // This should ideally not happen if userDataLoading is false, but as a fallback
      Alert.alert(t('error'), 'User ID not found. Please log in again.');
      // Consider navigating back to login or home if the user ID is crucial for this screen
      // navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
      return;
    }
    if (!address.trim() || !date || !timeSlot) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        userId: userId,
        userName: userName, // Pass userName
        userPhone: userPhone, // Pass userPhone
        userEmail: userEmail, // Pass userEmail
        address: address,
        date: date.toISOString(), // Send as ISO string
        timeSlot: timeSlot,
        price: SERVICE_FEE,
      };

      const response = await axios.post(`${API_URL}/api/custompickups`, requestData);

      if (response.status === 201) {
        Alert.alert(t('success'), t('pickupRequestSent'));
        // Optionally clear form or navigate
        setAddress('');
        setDate(null);
        setTimeSlot(null);
      } else {
        Alert.alert(t('error'), response.data.message || t('failedToSendRequest'));
      }
    } catch (error: any) {
      console.error('Error sending custom pickup request:', error.response?.data || error.message);
      Alert.alert(
        t('error'),
        error.response?.data?.message || t('failedToSendRequest') + '. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show a loading indicator if user data is still being fetched
  if (userDataLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('customPickupRequest')}</Text>
      <Text style={styles.description}>{t('customPickupDescription')}</Text>

      <Text style={styles.label}>{t('pickupAddress')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('enterAddress')}
        value={address}
        onChangeText={setAddress}
        editable={!loading}
      />
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.locationButtonText}>{t('useCurrentLocation')}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>{t('pickupDate')}</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.datePicker}
        disabled={loading}
      >
        <Text>{date ? date.toLocaleDateString() : t('selectDate')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()} // Can't pick past dates
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>{t('preferredTimeSlot')}</Text>
      <View style={styles.slotContainer}>
        <TouchableOpacity
          style={[styles.slotButton, timeSlot === t('morning') && styles.selectedSlot]}
          onPress={() => setTimeSlot(t('morning'))}
          disabled={loading}
        >
          <Text style={timeSlot === t('morning') && styles.selectedSlotText}>
            {t('morning')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.slotButton, timeSlot === t('afternoon') && styles.selectedSlot]}
          onPress={() => setTimeSlot(t('afternoon'))}
          disabled={loading}
        >
          <Text style={timeSlot === t('afternoon') && styles.selectedSlotText}>
            {t('afternoon')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.slotButton, timeSlot === t('evening') && styles.selectedSlot]}
          onPress={() => setTimeSlot(t('evening'))}
          disabled={loading}
        >
          <Text style={timeSlot === t('evening') && styles.selectedSlotText}>
            {t('evening')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{t('serviceFee')}: NPR {SERVICE_FEE}</Text>

      <TouchableOpacity
        style={[styles.confirmButton, (!userId || loading) && styles.disabledButton]} // Apply disabled style
        onPress={handleConfirmPickup}
        disabled={loading || !userId} // Disable if loading or userId is not available
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>{t('confirmPickup')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CustomPickupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  datePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  slotContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 30,
  },
  slotButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  selectedSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: { // Added for user data loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: { // Added for user data loading
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  disabledButton: { // New style for disabled button
    opacity: 0.6,
  },
});
