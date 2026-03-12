import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PlaceDetailScreen({ route }: any) {
  const { place } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du lieu</Text>
      <Text style={styles.text}>Nom : {place?.nom_usuel || 'Non renseigné'}</Text>
      <Text style={styles.text}>Adresse : {place?.adresse || 'Non renseignée'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});