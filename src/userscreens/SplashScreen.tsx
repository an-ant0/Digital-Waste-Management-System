import React, { useEffect } from 'react';
import i18n from '../i18n';
import { View, Text, Image, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Selection: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const checkLanguageAndNavigate = async () => {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        await i18n.changeLanguage(savedLang);
        navigation.replace('Selection');
      } else {
        navigation.replace('LanguageSelection');
      }
    };

    const timeout = setTimeout(checkLanguageAndNavigate, 2000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.text}>Sundar Dharan Hamro Abhiyan</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
