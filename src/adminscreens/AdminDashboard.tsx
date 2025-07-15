import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

const screenWidth = Dimensions.get('window').width;

const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [12, 19, 10, 15, 8, 18, 20],
    },
  ],
};

const recentReports = [
  { id: '1', title: 'Ward 3 - Garbage near park', date: '2025-07-06' },
  { id: '2', title: 'Ward 4 - Overflowing bin', date: '2025-07-05' },
  { id: '3', title: 'Ward 1 - Illegal dumping', date: '2025-07-04' },
];

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();



  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminProfile')}
          style={{ marginRight: 16 }}
        >
          <Icon name="account-circle" size={26} color="#1E90FF" />
        </TouchableOpacity>
      ),
      title: 'Admin Dashboard',
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>412</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Active Reports</Text>
          <Text style={styles.statValue}>36</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Active Trucks</Text>
          <Text style={styles.statValue}>5</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Points Redeemed</Text>
          <Text style={styles.statValue}>8,920</Text>
        </View>
      </View>

      {/* Weekly Graph */}
      <Text style={styles.sectionTitle}>Weekly Activity</Text>
      <LineChart
        data={weeklyData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})`,
          labelColor: () => '#333',
          strokeWidth: 2,
        }}
        style={styles.chart}
      />

      {/* Truck Status */}
      <Text style={styles.sectionTitle}>Truck Status</Text>
      <View style={styles.truckRow}>
        <View style={styles.truckBox}>
          <Text style={styles.truckStatusLabel}>Online</Text>
          <Text style={styles.truckStatusValue}>3</Text>
        </View>
        <View style={styles.truckBox}>
          <Text style={styles.truckStatusLabel}>Offline</Text>
          <Text style={styles.truckStatusValue}>2</Text>
        </View>
      </View>

      {/* Recent Reports */}
      <Text style={styles.sectionTitle}>Recent Reports</Text>
      <FlatList
        data={recentReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportDate}>{item.date}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  chart: {
    borderRadius: 10,
  },
  truckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  truckBox: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  truckStatusLabel: {
    fontSize: 14,
    color: '#777',
  },
  truckStatusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#333',
  },
  reportItem: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  reportDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
