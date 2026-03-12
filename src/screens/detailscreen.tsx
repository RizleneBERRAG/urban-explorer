import React, { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Calendar } from "react-native-calendars"
import { Lieu } from "../types/lieu"

type Props = {
  route: {
    params: {
      lieu: Lieu
    }
  }
}

export default function DetailScreen({ route }: Props) {
  const { lieu } = route.params
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lieu.nom_usuel}</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate || ""]: {
            selected: true,
            selectedColor: "blue",
          },
        }}
      />

      {selectedDate && (
        <Text style={styles.message}>
          Visite au {lieu.nom_usuel} planifiée le {selectedDate}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
  },
})