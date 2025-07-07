import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelection: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLanguageSelect = async (language: 'en' | 'np') => {
    try {
      await AsyncStorage.setItem('appLanguage', language);
      console.log('Language saved:', language);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert('Error', 'Failed to save language preference');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please select your language</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#005BBB' }]}
        onPress={() => handleLanguageSelect('en')}
      >
        <Text style={styles.buttonText}>🇺🇸 English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#DC3545' }]}
        onPress={() => handleLanguageSelect('np')}
      >
        <Text style={styles.buttonText}>🇳🇵 नेपाली</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
