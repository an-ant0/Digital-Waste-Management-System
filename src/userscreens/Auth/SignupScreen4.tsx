import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup4'>;

const SignupScreen4: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [agree, setAgree] = useState(false);

  const handleSignup = () => {
    if (!agree) {
      Alert.alert(t('acceptTermsTitle'), t('acceptTermsMessage'));
      return;
    }

    // Simulate success
    Alert.alert(t('signupSuccessTitle'), t('signupSuccessMessage'));
    navigation.navigate('UserLogin');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('termsTitle')}</Text>

      <View style={styles.termsBox}>
        <Text style={styles.termsText}>{t('termsLine1')}</Text>
        <Text style={styles.termsText}>{t('termsLine2')}</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={agree}
          onValueChange={setAgree}
          tintColors={{ true: '#007BFF', false: '#aaa' }}
        />
        <Text style={styles.checkboxLabel}>{t('agreeTerms')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.signupButton, { opacity: agree ? 1 : 0.6 }]}
        disabled={!agree}
        onPress={handleSignup}
      >
        <Text style={styles.signupButtonText}>{t('signup')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen4;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  termsBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
