import * as Location from "expo-location"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { APIRecord, Lieu } from "../types/lieu"

export default function MapScreen() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{latitude:number,longitude:number}|null>(null)

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          Alert.alert(
            "Permission localisation requise",
            "L'application a besoin de votre position pour afficher la carte.",
            [
              {
                text: "Continuer sans localisation",
                onPress: () => loadDefaultLocation(),
              },
              {
                text: "Ouvrir les réglages",
                onPress: () => Linking.openSettings(),
              },
            ]
          )
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        })

      } catch (err) {
        console.log("Erreur localisation", err)
        loadDefaultLocation()
      }
    }

    const loadDefaultLocation = () => {
      setUserLocation({
        latitude: 48.8566,
        longitude: 2.3522,
      })
    }

    requestLocationPermission()
  }, [])

  useEffect(() => {
    fetch(
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=que-faire-a-paris-&rows=50"
    )
      .then((res) => res.json())
      .then((data:any) => {
        if (data.records) {
          const lieuxTransformes:Lieu[] = data.records
            .filter((record:APIRecord) => {
              return (
                record.fields.coordonnees_geo ||
                (record.geometry?.coordinates &&
                  record.geometry.coordinates.length === 2)
              )
            })
            .map((item:APIRecord) => {
              let coords = item.fields.coordonnees_geo

              if (!coords && item.geometry?.coordinates) {
                coords = {
                  lat: item.geometry.coordinates[1],
                  lon: item.geometry.coordinates[0],
                }
              }

              return {
                id: item.recordid,
                nom_usuel:
                  item.fields.title ||
                  item.fields.nom_usuel ||
                  "Sans titre",
                adresse:
                  item.fields.address_name ||
                  item.fields.adresse ||
                  "",
                coordonnees_geo: coords || null,
                image:
                  item.fields.cover_url ||
                  "https://picsum.photos/200/200",
              }
            })

          setLieux(lieuxTransformes)
        }

        setLoading(false)
      })
      .catch(() => {
        setError("Erreur de chargement des données")
        setLoading(false)
      })
  }, [])

  if (loading || !userLocation) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Chargement de la carte...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>{error}</Text>
      </View>
    )
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
        showsUserLocation
      >
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Votre position"
          pinColor="blue"
        />

        {lieux.map((lieu, index) => {
          if (!lieu.coordonnees_geo) return null

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
  container:{flex:1},
  map:{flex:1},
  loading:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },
  error:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },
})