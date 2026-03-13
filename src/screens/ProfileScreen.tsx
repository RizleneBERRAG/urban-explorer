import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_AVATAR =
  "https://via.placeholder.com/300x300.png?text=Avatar";

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadSavedImage();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadSavedImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem("profileImage");
      if (savedImage) {
        setImageUri(savedImage);
      }
    } catch (error) {
      console.log("Erreur chargement image :", error);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.getCameraPermissionsAsync();

    if (!permission.granted) {
      const request = await ImagePicker.requestCameraPermissionsAsync();

      if (!request.granted) {
        Alert.alert(
          "Permission caméra requise",
          "Pour ajouter une photo de profil, vous devez autoriser l'accès à la caméra dans les réglages.",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Ouvrir les réglages",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        await AsyncStorage.setItem("profileImage", uri);
      } catch (error) {
        console.log("Erreur sauvegarde :", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      <Text style={styles.subtitle}>
        Ajoutez ou modifiez votre photo de profil
      </Text>

      <Animated.View
        style={[
          styles.avatarContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: imageUri || DEFAULT_AVATAR }}
          style={styles.avatar}
        />

        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>
          {imageUri ? "Changer la photo" : "Prendre une photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7f6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 30,
  },

  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#22c55e",
  },

  cameraButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#22c55e",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraIcon: {
    fontSize: 20,
    color: "#fff",
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});