import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    useNavigation,
    useRoute,
    RouteProp,
    CommonActions,
    useFocusEffect,
} from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../config';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const route = useRoute<ProfileScreenRouteProp>();
    const userId = route.params?.userId;

    // State
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [homeNumber, setHomeNumber] = useState('');
    const [wardNumber, setWardNumber] = useState('');
    const [localityName, setLocalityName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Validate
    const validatePhone = (num: string) => /^9\d{9}$/.test(num);
    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const fetchUserProfile = useCallback(async () => {
        if (!userId) {
            console.warn('User ID is missing');
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setLoading(true);
        setRefreshing(true);

        const url = `${API_URL}/profile/${userId}`;
        console.log('Fetching profile from URL:', url);

        try {
            const response = await fetch(url);

            console.log('Fetch response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                Alert.alert(
                    'Error',
                    `Failed to fetch profile: ${response.status} ${response.statusText}\nServer response: ${errorText}`
                );
                return;
            }

            const data = await response.json();
            console.log('Profile data received:', data);

            const profilePicUrl = data.profilePic
                ? `${API_URL.split('/api')[0]}/${data.profilePic.replace(/\\/g, '/')}`
                : null;

            setProfilePic(profilePicUrl);
            setFirstName(data.firstName || '');
            setMiddleName(data.middleName || '');
            setLastName(data.lastName || '');
            setPhone(data.phone || '');
            setEmail(data.email || '');
            setHomeNumber(data.homeNumber || '');
            setWardNumber(data.wardNumber || '');
            setLocalityName(data.localityName || '');

        } catch (error) {
            console.error('Network or other error during profile fetch:', error);
            Alert.alert(
                'Error',
                'Could not load profile. Check network connection or server.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);


    useEffect(() => {
        if (!userId) {
            Alert.alert(
                'Session Expired',
                'User ID is missing. Please login again.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'UserLogin' }],
                                }),
                            ),
                    },
                ],
            );
            return;
        }
        fetchUserProfile();
    }, [fetchUserProfile, navigation, userId]);

    // Hardware back
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isEditing) {
                    setIsEditing(false);
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [isEditing])
    );

    // Choose photo
    const handleChoosePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.5,
            includeBase64: true,
        });

        if (result.didCancel) return;
        if (result.errorCode) {
            Alert.alert('Error', result.errorMessage || 'Image selection failed.');
            return;
        }
        const asset = result.assets?.[0];
        if (asset?.uri && asset?.base64 && asset?.type) {
            setProfilePic(`data:${asset.type};base64,${asset.base64}`);
        } else {
            Alert.alert('Error', 'Failed to get image data.');
        }
    };

    // Save profile
    const handleSave = async () => {
        if (!validatePhone(phone)) {
            Alert.alert('Invalid phone number', 'Phone number must start with 9 and be 10 digits.');
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Invalid email address');
            return;
        }
        setSaving(true);

        try {
            const payload = {
                firstName,
                middleName,
                lastName,
                homeNumber,
                wardNumber,
                localityName,
                profilePic,
                phone,
                email,
            };
            const response = await fetch(`${API_URL}/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert('Saved', data.message || 'Profile updated successfully.');
                setIsEditing(false);
                if (data.profilePic) {
                    setProfilePic(`${API_URL.split('/api')[0]}/${data.profilePic.replace(/\\/g, '/')}`);
                }
            } else {
                Alert.alert('Error', data.message || 'Failed to update profile.');
                console.error('Backend Update Error:', data);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Could not update profile. Check network connection.');
        } finally {
            setSaving(false);
        }
    };

    // Logout
    const handleLogout = () => {
        Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    setLoggingOut(true);
                    try {
                        await AsyncStorage.multiRemove(["userId", "userName", "userRole"]);
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "UserLogin" }],
                            })
                        );
                    } catch (error) {
                        console.error("Logout error:", error);
                    } finally {
                        setLoggingOut(false);
                    }
                },
            },
        ]);
    };

    // Render
    if (loading) {
        return (
            <View style={[styles.container, styles.containerCentered]}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserProfile} />}
            keyboardShouldPersistTaps="handled"
        >
            <TouchableOpacity
                onPress={isEditing ? handleChoosePhoto : undefined}
                disabled={!isEditing}
                style={{ alignSelf: 'center' }}
            >
                <Image
                    source={profilePic ? { uri: profilePic } : require('../../assets/default-profile.png')}
                    style={styles.profileImage}
                />
                {isEditing && <Text style={styles.editText}>Edit Profile Picture</Text>}
            </TouchableOpacity>

            {/** Input fields */}
            {[
                { label: 'First Name', value: firstName, setter: setFirstName, placeholder: 'First Name' },
                { label: 'Middle Name', value: middleName, setter: setMiddleName, placeholder: 'Middle Name' },
                { label: 'Last Name', value: lastName, setter: setLastName, placeholder: 'Last Name' },
                { label: 'Phone Number', value: phone, setter: setPhone, placeholder: '9xxxxxxxxx', keyboardType: 'phone-pad', maxLength: 10 },
                { label: 'Email', value: email, setter: setEmail, placeholder: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
                { label: 'Home Number', value: homeNumber, setter: setHomeNumber, placeholder: 'Home Number' },
                { label: 'Ward Number', value: wardNumber, setter: setWardNumber, placeholder: 'Ward Number' },
                { label: 'Locality Name', value: localityName, setter: setLocalityName, placeholder: 'Locality Name' },
            ].map((field, idx) => (
                <View style={styles.field} key={idx}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                        editable={isEditing}
                        value={field.value}
                        onChangeText={field.setter}
                        style={styles.input}
                        placeholder={field.placeholder}
                        keyboardType={field.keyboardType as any}
                        maxLength={field.maxLength}
                        autoCapitalize={field.autoCapitalize as any || 'sentences'}
                    />
                </View>
            ))}

            {isEditing ? (
                <TouchableOpacity
                    style={[styles.saveButton, { opacity: saving ? 0.6 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.logoutButton, { opacity: loggingOut ? 0.6 : 1 }]}
                        onPress={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.logoutText}>Logout</Text>}
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { padding: 24, backgroundColor: '#F9F9F9', flexGrow: 1 },
    containerCentered: { justifyContent: 'center', alignItems: 'center' },
    profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
    editText: { textAlign: 'center', color: '#007BFF', marginBottom: 20 },
    field: { marginBottom: 20 },
    label: { fontSize: 14, color: '#444', marginBottom: 6 },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
    saveButton: { backgroundColor: '#28a745', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    editButton: { backgroundColor: '#007BFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    logoutButton: { backgroundColor: '#dc3545', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    errorText: { fontSize: 18, color: 'red', marginBottom: 20, textAlign: 'center' },
});
