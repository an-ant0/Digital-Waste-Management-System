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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';

const SERVICE_FEE = 200;

// TODO: Replace with your actual Google Maps API Key
Geocoder.init('YOUR_GOOGLE_MAPS_API_KEY');

const CustomPickupScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('customPickup') });
  }, [navigation, t]);

  const [address, setAddress] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);

  const handleConfirmPickup = () => {
    if (!address.trim() || !date || !timeSlot) {
      Alert.alert(t('missingFields'), t('pleaseFillAllFields'));
      return;
    }

    Alert.alert(
      t('pickupRequested'),
      t('pickupSuccessMessage', {
        date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        timeSlot,
        address,
        fee: SERVICE_FEE,
      })
    );

    setAddress('');
    setDate(null);
    setTimeSlot(null);
  };

  const useCurrentLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(t('permissionDenied'), t('locationPermissionRequired'));
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await Geocoder.from(latitude, longitude);
            const formattedAddress = geoRes.results[0].formatted_address;
            setAddress(formattedAddress);
          } catch (err) {
            Alert.alert(t('geocodingError'), t('couldNotGetAddress'));
          }
        },
        (error) => {
          Alert.alert(t('locationError'), error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (e) {
      Alert.alert(t('error'), t('somethingWentWrong'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('customPickup')}</Text>

      <Text style={styles.description}>
        {t('customPickupDescription', { fee: SERVICE_FEE })}
      </Text>

      <Text style={styles.label}>{t('pickupAddress')} *</Text>
      <TextInput
        placeholder={t('enterFullAddress')}
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
        <Text style={styles.locationButtonText}>{t('useCurrentLocation')}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>{t('pickupDate')} *</Text>
      <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: date ? '#000' : '#999' }}>
          {date
            ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            : t('selectDate')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>{t('timeSlot')} *</Text>
      <View style={styles.slotContainer}>
        {[t('slotMorning'), t('slotAfternoon'), t('slotEvening')].map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slotButton,
              timeSlot === slot && styles.selectedSlotButton,
            ]}
            onPress={() => setTimeSlot(slot)}
          >
            <Text
              style={[
                styles.slotText,
                timeSlot === slot && styles.selectedSlotText,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirmPickup}>
        <Text style={styles.buttonText}>
          {t('confirmPickupWithFee', { fee: SERVICE_FEE })}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CustomPickupScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
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
    paddingHorizontal: 16,
  },
  selectedSlotButton: {
    borderColor: '#1E90FF',
    backgroundColor: '#E6F0FF',
  },
  slotText: {
    fontSize: 14,
    color: '#444',
  },
  selectedSlotText: {
    color: '#1E90FF',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
