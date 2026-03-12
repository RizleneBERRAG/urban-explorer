import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { Lieu } from "../types/lieu"

export default function MapScreen() {
  const [lieux, setLieux] = useState<Lieu[]>([])

  useEffect(() => {
  fetch(
    "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/lieux-culturels-a-paris/records?limit=30"
  )
    .then((res) => res.json())
    .then((data) => {
      // Adapter au vrai format de l'API
      const lieuxAPI = data.records.map((item: any) => ({
        nom_usuel: item.fields.nom_usuel,
        adresse: item.fields.adresse,
        coordonnees_geo: item.fields.coordonnees_geo,
      }));
      setLieux(lieuxAPI);
    })
    .catch((err) => console.log(err));
}, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
}); 