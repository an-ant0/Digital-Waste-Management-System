import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import axios from 'axios';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import io from 'socket.io-client'; // Import Socket.IO client
import { API_URL } from '../config';

const BACKEND_URL = API_URL;
const TRUCK_ID = 'T-001'; // In a real app, this would come from user session/login

// The interval for sending location updates in milliseconds (e.g., every 10 seconds)
const UPDATE_INTERVAL = 10000; // This constant is correctly defined here.

const TruckDriverScreen: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const watchId = useRef<number | null>(null);
  const socket = useRef<ReturnType<typeof io> | null>(null); // Ref to hold the Socket.IO instance

  // Initialize Socket.IO connection when the component mounts
  useEffect(() => {
    socket.current = io(BACKEND_URL, {
      transports: ['websocket'], // Ensure WebSocket is preferred
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.current.on('connect', () => {
      console.log('Connected to Socket.IO server from Truck Driver app');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server from Truck Driver app');
    });

    socket.current.on('connect_error', (err: Error) => {
      console.error('Socket.IO connection error:', err.message);
      Alert.alert('Connection Error', `Could not connect to backend: ${err.message}`);
    });

    // Clean up Socket.IO connection when the component unmounts
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // Request Location permission (Android/iOS)
  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    try {
      const result = await check(permission);
      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        const granted = await request(permission);
        return granted === RESULTS.GRANTED;
      }
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  };

  // Send current location to backend API and emit via Socket.IO
  const sendLocationToServer = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      // 1. Send via HTTP PUT request (for persistence and initial state)
      await axios.put(`${BACKEND_URL}/api/trucks/${TRUCK_ID}/location`, {
        latitude,
        longitude,
      });
      console.log('Location sent via HTTP:', latitude, longitude);

      // 2. Emit via Socket.IO for real-time updates
      if (socket.current && socket.current.connected) {
        socket.current.emit('truckLocationUpdate', {
          truckId: TRUCK_ID,
          currentLocation: { latitude, longitude },
          lastUpdated: new Date().toISOString(),
          status: 'active', // Assuming the truck is active when tracking
          // You might also include driverName, plateNumber, etc., if available in the driver app
        });
        console.log('Location emitted via Socket.IO:', latitude, longitude);
      } else {
        console.warn('Socket.IO not connected, location not emitted.');
      }

    } catch (error) {
      console.error('Failed to send location:', error);
      Alert.alert('Error', 'Failed to send location update to server.');
    }
  };

  // Start watching location
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    setIsTracking(true);
    // Get initial position immediately
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        sendLocationToServer(latitude, longitude); // Send initial location
      },
      (error) => {
        console.error('Initial location error:', error);
        Alert.alert('Location Error', `Could not get initial location: ${error.message}`);
        setIsTracking(false); // Stop tracking if initial location fails
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Set up a watch for continuous updates
    watchId.current = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        sendLocationToServer(latitude, longitude); // Send continuous updates
      },
      (error) => {
        console.error('Location watch error:', error);
        Alert.alert('Location Error', `Location tracking stopped: ${error.message}`);
        stopTracking(); // Stop tracking on error
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update if moved by 10 meters
        interval: UPDATE_INTERVAL, // <--- `UPDATE_INTERVAL` is used here
        fastestInterval: 5000, // No more frequent than 5 seconds
        showsBackgroundLocationIndicator: true, // iOS background indicator
      }
    );
  };

  // Stop watching location
  const stopTracking = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    Alert.alert('Tracking Stopped', 'Location tracking has been turned off.');
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTracking(); // Ensure tracking is stopped when component unmounts
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Truck Driver Location Tracking</Text>
      <Text style={styles.status}>
        {isTracking ? 'Tracking is ON' : 'Tracking is OFF'}
      </Text>

      <MapView
        style={styles.map}
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        showsUserLocation={true}
        followsUserLocation={true}
        loadingEnabled={true}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="This is where you are now"
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <TouchableOpacity style={styles.startButton} onPress={startTracking}>
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TruckDriverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    color: '#444',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
  },
  stopButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#555',
  },
});
