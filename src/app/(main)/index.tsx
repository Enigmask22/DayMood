import RecordsList from "src/components/homepage/RecordsList";
import Greeting from "src/components/homepage/Greeting";
import { HOME_COLOR } from "src/utils/constant";
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MoodPromptCard from "src/components/homepage/MoodPromptCard";
import { useAppSelector } from "src/store";
const { width, height } = Dimensions.get("window");
const HomePage = () => {
  const records = useAppSelector((state) => state.records.records);
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
    paddingBottom: height * 0.02,
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
