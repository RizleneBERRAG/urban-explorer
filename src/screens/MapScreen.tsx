import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native"
import MapView, { Marker } from "react-native-maps"
import * as Location from 'expo-location';
import { Lieu, APIRecord } from "../types/lieu"

export default function MapScreen() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)

  useEffect(() => {
    // Request location permission
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission requise',
            "L'application a besoin de l'accès à votre localisation pour afficher la carte.",
            [
              { text: 'OK', onPress: () => loadDefaultLocation() }
            ]
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        console.log("User location:", currentLocation.coords.latitude, currentLocation.coords.longitude);
      } catch (err) {
        console.error("Location error:", err);
        loadDefaultLocation();
      }
    };

    const loadDefaultLocation = () => {
      // Default to Paris center if permission denied or error
      setUserLocation({
        latitude: 48.8566,
        longitude: 2.3522,
      });
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Fetch lieux data
    fetch(
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=que-faire-a-paris-&rows=50"
    )
      .then((res) => res.json())
      .then((data: any) => {
        console.log("Map API Response:", data);
        if (data.records && Array.isArray(data.records)) {
          // Adapter au vrai format de l'API avec coordinates fallback
          const lieuxTransformes: Lieu[] = data.records
            .filter((record: APIRecord) => {
              // Filter out entries without valid coordinates
              const hasCoords = record.fields.coordonnees_geo || 
                               (record.geometry?.coordinates && record.geometry.coordinates.length === 2);
              if (!hasCoords) {
                console.log("Skipping entry without coords:", record.fields.nom_usuel || record.fields.title);
              }
              return hasCoords;
            })
            .map((item: APIRecord) => {
              let coords = item.fields.coordonnees_geo;
              
              // Fallback to geometry.coordinates if coordonnees_geo is missing
              if (!coords && item.geometry?.coordinates) {
                coords = {
                  lat: item.geometry.coordinates[1],
                  lon: item.geometry.coordinates[0]
                };
              }
              
              return {
                id: item.recordid,
                nom_usuel: item.fields.title || item.fields.nom_usuel || 'Sans titre',
                adresse: item.fields.address_name || item.fields.adresse || '',
                coordonnees_geo: coords || null,
                image: item.fields.cover_url || item.fields.main_image || item.fields.image || 'https://picsum.photos/200/200',
              };
            });
          
          console.log("Map lieux with coordinates:", lieuxTransformes.length);
          setLieux(lieuxTransformes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Map API Error:", err);
        setError("Erreur de chargement des données");
        setLoading(false);
      });
  }, []);

  if (loading || !userLocation) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 10}}>Chargement de la carte...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Votre position"
            description="Vous êtes ici"
            pinColor="blue"
          />
        )}
        
        {/* Cultural places markers */}
        {lieux.map((lieu, index) => {
          if (!lieu.coordonnees_geo) {
            console.log("Skipping marker without coords:", lieu.nom_usuel);
            return null;
          }
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: lieu.coordonnees_geo.lat,
                longitude: lieu.coordonnees_geo.lon,
              }}
              title={lieu.nom_usuel}
              description={lieu.adresse}
            />
          )
        })}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 