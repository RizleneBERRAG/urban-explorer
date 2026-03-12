import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState, useContext } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    loadSavedImage();
  }, []);

  const loadSavedImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setImageUri(savedImage);
      }
    } catch (error) {
      console.log('Erreur chargement image :', error);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission refusée',
        "L'application a besoin de l'accès à la caméra."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      try {
        await AsyncStorage.setItem('profileImage', uri);
      } catch (error) {
        console.log('Erreur sauvegarde image :', error);
      }
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDarkMode ? '#fff' : '#1a1a1a' }
      ]}>Mon Profil</Text>
      <Text style={[
        styles.subtitle,
        { color: isDarkMode ? '#aaa' : '#666' }
      ]}>
        Prenez un selfie souvenir directement depuis l'application.
      </Text>
  
      <Image
        source={{
          uri:
            imageUri ||
            'https://via.placeholder.com/200x200.png?text=Avatar',
        }}
        style={styles.avatar}
      />
  
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>
          {imageUri ? 'Reprendre une photo' : 'Prendre une photo'}
        </Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={[styles.button, styles.themeButton]} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          {isDarkMode ? 'Passer en mode clair ☀️' : 'Passer en mode sombre 🌙'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  avatar: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#eaeaea',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    marginBottom: 12,
  },
  themeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});