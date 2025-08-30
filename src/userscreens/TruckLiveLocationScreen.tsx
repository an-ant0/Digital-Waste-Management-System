import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../config';

interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

interface TruckAPIResponseData {
  truckId: string;
  driverName: string;
  currentLocation: LocationCoordinate;
  lastUpdated: string;
  status: string;
}

interface TruckDataInState {
  truckId: string;
  driverName: string;
  currentLocation: LocationCoordinate;
  lastUpdated: string;
  status: string;
}

const TruckLiveLocationScreen: React.FC = () => {
  const [nearbyTrucks, setNearbyTrucks] = useState<TruckDataInState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinate | null>(null);

  // Simulate user location (Kathmandu)
  useEffect(() => {
    setUserLocation({ latitude: 27.7172, longitude: 85.3240 });
  }, []);

  // Calculate distance between two points in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter trucks within 5 km of user
  const filterNearbyTrucks = (allTrucks: TruckAPIResponseData[], userLoc: LocationCoordinate | null): TruckDataInState[] => {
    if (!userLoc) return [];
    const MAX_DISTANCE_KM = 5;
    return allTrucks.filter(truck => {
      const distance = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        truck.currentLocation.latitude,
        truck.currentLocation.longitude
      );
      return distance <= MAX_DISTANCE_KM;
    });
  };

  useEffect(() => {
    let isMounted = true;
    let socket: ReturnType<typeof io>;

    const fetchAndFilterTrucks = async () => {
      if (!userLocation) {
        setLoading(true);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<TruckAPIResponseData[]>(`${API_URL}/api/trucks/locations/all`);
        if (isMounted) {
          if (Array.isArray(response.data)) {
            const filtered = filterNearbyTrucks(response.data, userLocation);
            setNearbyTrucks(filtered);
          } else {
            setError('No active trucks found or unexpected data format.');
            setNearbyTrucks([]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching trucks:', err);
        if (isMounted) {
          setError(`Failed to fetch trucks: ${err.message || 'Unknown error'}`);
          setNearbyTrucks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndFilterTrucks();

    socket = io(API_URL);

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server (User)');
      if (isMounted) setError(null);
    });

    socket.on('truckLocationUpdate', (data: any) => {
      if (!isMounted || !userLocation) return;

      const updatedTruck: TruckDataInState = {
        truckId: data.truckId,
        driverName: data.driverName ?? 'Unknown Driver',
        currentLocation: { latitude: data.latitude, longitude: data.longitude },
        lastUpdated: data.lastUpdated ?? new Date().toISOString(),
        status: data.status ?? 'active',
      };

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        updatedTruck.currentLocation.latitude,
        updatedTruck.currentLocation.longitude
      );

      const MAX_DISTANCE_KM = 5;

      if (distance <= MAX_DISTANCE_KM) {
        setNearbyTrucks(prevTrucks => {
          const index = prevTrucks.findIndex(t => t.truckId === updatedTruck.truckId);
          if (index > -1) {
            const newTrucks = [...prevTrucks];
            newTrucks[index] = updatedTruck;
            return newTrucks;
          }
          return [...prevTrucks, updatedTruck];
        });
      } else {
        setNearbyTrucks(prevTrucks => prevTrucks.filter(t => t.truckId !== updatedTruck.truckId));
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server (User)');
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket.IO connection error (User):', err.message);
      if (isMounted) setError(`Socket.IO connection failed: ${err.message}`);
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [userLocation]);

  if (loading || !userLocation) {
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

  if (nearbyTrucks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No garbage trucks found in your area.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker coordinate={userLocation} title="Your Location" pinColor="blue" />

        {nearbyTrucks.map(truck => (
          <Marker
            key={truck.truckId}
            coordinate={truck.currentLocation}
            title={`Truck ID: ${truck.truckId}`}
            description={`Driver: ${truck.driverName}\nStatus: ${truck.status}\nLast Updated: ${new Date(truck.lastUpdated).toLocaleTimeString()}`}
          />
        ))}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
