import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../config';


interface TruckLocationData {
  truckId: string;
  driverName: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  status: string;
}

const TruckLocationScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<TruckLocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let socket: ReturnType<typeof io>;

    // Fetch initial trucks
    const fetchInitialTruckLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/api/trucks/locations/all`);

        if (isMounted) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            setTrucks(response.data);
          } else {
            setError('No active trucks found or unexpected data format.');
            setTrucks([]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching initial truck locations:', err);
        if (isMounted) {
          setError(`Failed to fetch truck locations: ${err.message || 'Unknown error'}. Please ensure backend is running.`);
          setTrucks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialTruckLocations();

    // Connect socket.io client
    socket = io(API_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (isMounted) setError(null);
    });

    socket.on('truckLocationUpdate', (data: TruckLocationData & { latitude?: number; longitude?: number }) => {
      console.log('Received truck location update:', data);
      if (!isMounted) return;

      setTrucks(prevTrucks => {
        const index = prevTrucks.findIndex(t => t.truckId === data.truckId);

        const newLocation = {
          latitude: data.latitude ?? data.currentLocation.latitude,
          longitude: data.longitude ?? data.currentLocation.longitude,
        };

        if (index !== -1) {
          // Update existing truck
          const updatedTrucks = [...prevTrucks];
          updatedTrucks[index] = {
            ...updatedTrucks[index],
            currentLocation: newLocation,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            status: data.status || updatedTrucks[index].status,
            driverName: data.driverName || updatedTrucks[index].driverName,
          };
          return updatedTrucks;
        } else {
          // Add new truck if not found
          return [...prevTrucks, {
            truckId: data.truckId,
            driverName: data.driverName,
            currentLocation: newLocation,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            status: data.status || 'unknown',
          }];
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket.IO connection error:', err.message);
      if (isMounted) setError(`Socket.IO connection failed: ${err.message}`);
    });

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Please ensure your backend server is running and accessible at {API_URL}.</Text>
      </View>
    );
  }

  if (trucks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No truck data available.</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: trucks[0].currentLocation.latitude,
        longitude: trucks[0].currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={false}
      showsMyLocationButton={true}
    >
      {trucks.map(truck => (
        <Marker
          key={truck.truckId}
          coordinate={{
            latitude: truck.currentLocation.latitude,
            longitude: truck.currentLocation.longitude,
          }}
          title={`Truck ID: ${truck.truckId}`}
          description={`Driver: ${truck.driverName}\nStatus: ${truck.status}\nLast Updated: ${new Date(truck.lastUpdated).toLocaleTimeString()}`}
        />
      ))}
    </MapView>
  );
};

export default TruckLocationScreen;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
