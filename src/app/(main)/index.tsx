import RecordsList from "@/components/RecordList";
import { HOME_COLOR } from "@/utils/constant";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomePage = () => {
  const records = [
    {
      date: "THURSDAY, MARCH 6 20:00",
      emoji: "sad",
      feeling: "I'm feeling bad",
    },
    {
      date: "FRIDAY, MARCH 7 18:00",
      emoji: "excellent",
      feeling: "I'm feeling great",
    },
    {
      date: "SATURDAY, MARCH 8 14:00",
      emoji: "joyful",
      feeling: "I'm feeling okay",
    },
    {
      date: "SUNDAY, MARCH 9 12:00",
      emoji: "normal",
      feeling: "I'm feeling normal",
    },
    {
      date: "MONDAY, MARCH 10 10:00",
      emoji: "angry",
      feeling: "I'm feeling angry",
    },
    // Add more records as needed
  ];
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { paddingVertical: 180 }]}>
        Welcome to the Homepage!
      </Text>
      <RecordsList records={records} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HomePage;
