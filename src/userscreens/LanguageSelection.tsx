import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n'; // Adjust path as needed
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  LanguageSelection: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelection: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();

  const handleLanguageSelect = async (language: 'en' | 'ne') => {
    try {
      await AsyncStorage.setItem('appLanguage', language);
      await i18n.changeLanguage(language);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save language preference');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6799ce' }]}
        onPress={() => handleLanguageSelect('en')}
      >
        <Text style={styles.buttonText}>🇺🇸 {t('english')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#cf6670' }]}
        onPress={() => handleLanguageSelect('ne')}
      >
        <Text style={styles.buttonText}>🇳🇵 {t('nepali')}</Text>
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
