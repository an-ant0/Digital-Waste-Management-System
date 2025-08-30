import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

type User = {
  _id: string; 
  firstName: string;
  middleName?: string; 
  lastName: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  role: 'user' | 'admin';
  homeNumber: string;
  wardNumber: string;
  localityName: string;
  profilePic?: string; 
  idType: string;
  idNumber: string;
  idPhoto?: string; 
  createdAt: string;
  updatedAt: string;
};

const ManageUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/users/all`);
      const nonAdminUsers = response.data.filter((user: User) => user.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      Alert.alert('Error', 'Failed to load users. Please ensure the backend is running and accessible.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isBlocked: !currentStatus } : user
      )
    );

    if (selectedUser && selectedUser._id === userId) {
      setSelectedUser(prevUser => (prevUser ? { ...prevUser, isBlocked: !currentStatus } : null));
    }

    try {
      await axios.put(`${API_URL}/api/users/${userId}/block`, {
        isBlocked: !currentStatus,
      });
      Alert.alert('Success', `User ${!currentStatus ? 'blocked' : 'unblocked'} successfully.`);
    } catch (err: any) {
      console.error('Error toggling block status:', err);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isBlocked: currentStatus } : user
        )
      );
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prevUser => (prevUser ? { ...prevUser, isBlocked: currentStatus } : null));
      }
      Alert.alert('Error', `Failed to ${!currentStatus ? 'block' : 'unblock'} user: ${err.response?.data?.message || err.message}`);
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.card} onPress={() => openUserDetails(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{`${item.firstName} ${item.middleName ? item.middleName + ' ' : ''}${item.lastName}`}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.address}>{`Ward: ${item.wardNumber}, ${item.localityName}`}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: item.isBlocked ? '#28a745' : '#dc3545' },
        ]}
        onPress={() => toggleBlock(item._id, item.isBlocked)}
      >
        <Text style={styles.buttonText}>
          {item.isBlocked ? 'Unblock' : 'Block'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Users</Text>

      <TextInput
        placeholder="Search by name, email, or phone"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No users found.</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>User Details</Text>

                {selectedUser.profilePic ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: selectedUser.profilePic }}
                      style={styles.profileModalImage}
                    />
                    <Text style={styles.imageLabel}>Profile Picture</Text>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                     <Text style={styles.imagePlaceholderText}>No Profile Pic</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Full Name:</Text>
                  <Text style={styles.detailValue}>
                    {`${selectedUser.firstName} ${selectedUser.middleName ? selectedUser.middleName + ' ' : ''}${selectedUser.lastName}`}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Home Number:</Text>
                  <Text style={styles.detailValue}>{selectedUser.homeNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ward Number:</Text>
                  <Text style={styles.detailValue}>{selectedUser.wardNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Locality:</Text>
                  <Text style={styles.detailValue}>{selectedUser.localityName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID Type:</Text>
                  <Text style={styles.detailValue}>{selectedUser.idType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID Number:</Text>
                  <Text style={styles.detailValue}>{selectedUser.idNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Status:</Text>
                  <Text style={[styles.detailValue, { color: selectedUser.isBlocked ? 'red' : 'green' }]}>
                    {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role:</Text>
                  <Text style={styles.detailValue}>{selectedUser.role}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registered On:</Text>
                  <Text style={styles.detailValue}>{new Date(selectedUser.createdAt).toLocaleDateString()}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: selectedUser.isBlocked ? '#28a745' : '#dc3545' },
                  ]}
                  onPress={() => toggleBlock(selectedUser._id, selectedUser.isBlocked)}
                >
                  <Text style={styles.buttonText}>
                    {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageUsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
        flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  profileModalImage: {
    width: 120, 
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  imagePlaceholder: {
    width: 120, 
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 60, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: '#6c757d', 
  },
});