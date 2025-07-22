import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import io from 'socket.io-client';
import axios from 'axios';

interface TruckLocation {
  latitude: number;
  longitude: number;
}

// Define the API base URL for your backend.
// Use your machine's local IP address if testing on a physical device on the same network.
// For Android Emulator, '10.0.2.2' refers to your development machine's localhost.
const API_BASE_URL = 'http://192.168.1.76:5000'; 

const TruckLiveLocationScreen = () => {
  const [location, setLocation] = useState<TruckLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null); // To store the ID of the truck we're tracking

  useEffect(() => {
    let socket: any;

    const fetchInitialTruckLocation = async () => {
      try {
        // Corrected the URL for axios.get
        const response = await axios.get(`${API_BASE_URL}/api/trucks/locations/all`);
        
        if (response.data && response.data.length > 0) {
          const firstTruck = response.data[0];
          setLocation({
            latitude: firstTruck.currentLocation.latitude,
            longitude: firstTruck.currentLocation.longitude,
          });
          setTruckId(firstTruck.truckId);
        } else {
          setError('No active trucks found.');
        }
      } catch (err: any) {
        console.error('Error fetching initial truck location:', err);
        setError(`Failed to fetch initial truck location: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTruckLocation();

    socket = io(API_BASE_URL); 

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setError(null);
    });

    socket.on('truckLocationUpdate', (data: any) => {
      console.log('Received truck location update:', data);
      
      if (truckId === null || data.truckId === truckId) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setTruckId(data.truckId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket.IO connection error:', err.message);
      setError(`Socket.IO connection failed: ${err.message}. Please ensure your backend is running.`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [truckId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Please ensure your backend server is running and accessible at {API_BASE_URL}.</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No truck location available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={truckId ? `Garbage Truck ID: ${truckId}` : "Garbage Truck"}
          description="Current Location"
        />
      </MapView>
    </View>
  );
};

export default TruckLiveLocationScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});