import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const TruckLocationScreen: React.FC = () => {
  const [truckLocation, setTruckLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        // Replace this URL with your real API endpoint
        const res = await fetch('https://yourapi.com/api/truck-location');
        if (!res.ok) throw new Error('Failed to fetch location');
        const data = await res.json();

        if (isMounted && data.lat && data.lng) {
          setTruckLocation({ latitude: data.lat, longitude: data.lng });
          setLoading(false);
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch truck location');
        setLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000); // refresh every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (!truckLocation) {
    return <View style={styles.center}><Text>Location data unavailable</Text></View>;
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...truckLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
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
