import RecordsList from "@/components/homepage/RecordsList";
import Greeting from "@/components/homepage/Greeting";
import { HOME_COLOR } from "@/utils/constant";
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MoodPromptCard from "@/components/homepage/MoodPromptCard";
const { width, height } = Dimensions.get("window");
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
      feeling: "I'm feeling joyful",
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
      <View style={styles.introContainer}>
        <Greeting />
        <MoodPromptCard />
      </View>
      <View style={styles.listContainer}>
        <RecordsList records={records} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  introContainer: {
    flex: 0.51,
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "red",
  },
  background: {
    height: height * 0.4,
    width: width,
    padding: height * 0.05,
    marginBottom: height * 0.03,
  },
  greeting: {
    fontSize: 16,
    color: "#000",
  },
  quote: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 0.49,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomePage;
