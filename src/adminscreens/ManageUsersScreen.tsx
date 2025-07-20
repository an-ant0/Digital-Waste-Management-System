import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

type User = {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
};

const initialUsers: User[] = [
    { id: '1', name: 'Ramesh Thapa', email: 'ramesh@example.com', isBlocked: false },
    { id: '2', name: 'Sita Karki', email: 'sita@example.com', isBlocked: true },
    { id: '3', name: 'Anil Bista', email: 'anil@example.com', isBlocked: false },
];

const ManageUsersScreen: React.FC = () => {
    const [users, setUsers] = useState(initialUsers);
    const [searchText, setSearchText] = useState('');

    const toggleBlock = (userId: string) => {
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        );
        setUsers(updatedUsers);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: item.isBlocked ? '#28a745' : '#dc3545' },
                ]}
                onPress={() => toggleBlock(item.id)}
            >
                <Text style={styles.buttonText}>
                    {item.isBlocked ? 'Unblock' : 'Block'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Manage Users</Text>

            <TextInput
                placeholder="Search by name or email"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
            />

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
            />
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
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
