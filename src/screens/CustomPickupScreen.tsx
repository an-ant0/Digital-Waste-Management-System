import React, { useEffect, useState } from 'react';
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

const SERVICE_FEE = 200;

// 🔐 Replace this with your actual Google Maps API Key
Geocoder.init('YOUR_GOOGLE_MAPS_API_KEY');

const CustomPickupScreen: React.FC = () => {
  const [address, setAddress] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);

  const handleConfirmPickup = () => {
    if (!address.trim() || !date || !timeSlot) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    Alert.alert(
      'Pickup Requested',
      `Your request has been submitted.\n\nDate: ${date.toDateString()}\nTime Slot: ${timeSlot}\nAddress: ${address}\n\nA fee of Rs. ${SERVICE_FEE} will be applied.`
    );

    // Reset form
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
          Alert.alert('Permission denied', 'Location permission is required.');
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
            Alert.alert('Geocoding error', 'Could not get address.');
          }
        },
        (error) => {
          Alert.alert('Location Error', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Custom Pickup Request</Text>

        <Text style={styles.description}>
          For large events, hotels, or businesses, request special garbage pickups. A service fee of Rs. {SERVICE_FEE} per request will be applied.
        </Text>

        <Text style={styles.label}>Pickup Address *</Text>
        <TextInput
          placeholder="Enter full address"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
          <Text style={styles.locationButtonText}>Use My Current Location</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Preferred Pickup Date *</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: date ? '#000' : '#999' }}>
            {date ? date.toDateString() : 'Select a date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Preferred Time Slot *</Text>
        <View style={styles.slotContainer}>
          {['Morning (6:00 AM - 10:00 AM)', 'Afternoon (12:00 PM - 4:00 PM)', 'Evening (5:00 PM - 7:00 PM)'].map((slot) => (
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
          <Text style={styles.buttonText}>Confirm Pickup - Rs. {SERVICE_FEE}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CustomPickupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 20,
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
    backgroundColor: '#1E90FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
