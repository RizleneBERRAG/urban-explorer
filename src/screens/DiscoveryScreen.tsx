import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function DiscoveryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Découverte</Text>
      <Text style={styles.text}>
        Ici on affichera la liste des lieux culturels.
      </Text>

      <Button
        title="Voir un détail de test"
        onPress={() =>
          navigation.navigate('DetailLieu', {
            place: {
              nom_usuel: 'Lieu de test',
              adresse: 'Adresse de test',
            },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});