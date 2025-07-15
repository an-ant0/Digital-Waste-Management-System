import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const TruckLocationScreen = () => {
  const [truckLocation, setTruckLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Example: Replace with actual API call or Firebase listener
    const fetchLocation = async () => {
      const res = await fetch('https://yourapi.com/api/truck-location');
      const data = await res.json();
      setTruckLocation({ latitude: data.lat, longitude: data.lng });
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  if (!truckLocation) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <MapView
      style={styles.map}
      region={{
        ...truckLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={truckLocation} title="Garbage Truck" />
    </MapView>
  );
};

export default TruckLocationScreen;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
