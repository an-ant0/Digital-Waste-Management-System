import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type Location = {
  latitude: number;
  longitude: number;
};

const TruckLocationScreen: React.FC = () => {
  const [truckLocation, setTruckLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        // Replace this URL with your actual backend API endpoint
        const response = await fetch('https://yourapi.com/api/location');
        if (!response.ok) throw new Error('Failed to fetch location');

        const data = await response.json();

        // Validate if the data contains latitude and longitude
        if (isMounted && data.latitude && data.longitude) {
          setTruckLocation({
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          });
          setLoading(false);
        } else {
          if (isMounted) {
            setTruckLocation(null);
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          Alert.alert('Error', 'Unable to fetch truck location');
          setLoading(false);
        }
      }
    };

    fetchLocation();

    // Refresh location every 10 seconds
    const interval = setInterval(fetchLocation, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }

  if (!truckLocation) {
    return (
      <View style={styles.center}>
        <Text>Location data unavailable</Text>
      </View>
    );
  }

  // Define region based on current truck location
  const region: Region = {
    latitude: truckLocation.latitude,
    longitude: truckLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      showsUserLocation={false}
      showsMyLocationButton={true}
    >
      <Marker
        coordinate={truckLocation}
        title="Garbage Truck"
        description="Current location of the truck"
      />
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
});
