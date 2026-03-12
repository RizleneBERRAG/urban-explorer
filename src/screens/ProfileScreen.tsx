import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

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
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      <Text style={styles.subtitle}>
        Prenez un selfie souvenir directement depuis l’application.
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});