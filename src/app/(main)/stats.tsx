import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths } from "date-fns";
import EmotionPage from "@/components/stats/emotion";

const { width, height } = Dimensions.get("window");

// Tab options
const tabs = [
  { id: "general", label: "General" },
  { id: "activity", label: "Activity" },
  { id: "emotion", label: "Emotion" },
];

const StatsPage = () => {
  const [selectedTab, setSelectedTab] = useState("emotion");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Function to handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Function to handle month navigation
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentDate, "MMMM, yyyy")}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.selectedTabButton,
              tab.id === "emotion" ? { backgroundColor: selectedTab === tab.id ? "#4CAF50" : "#f1f1f1" } : null
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.selectedTabText,
                tab.id === "emotion" && selectedTab === tab.id ? { color: "#FFFFFF" } : null
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(() => {
        switch (selectedTab) {
          case "emotion":
            return (
              <EmotionPage
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            );
          case "general":
            return (
              <View style={styles.otherTabContent}>
                <Text style={styles.comingSoonText}>
                  General tab content coming soon
                </Text>
              </View>
            );
          case "activity":
            return (
              <View style={styles.otherTabContent}>
                <Text style={styles.comingSoonText}>
                  Activity tab content coming soon
                </Text>
              </View>
            );
          default:
            return (
              <View style={styles.otherTabContent}>
                <Text style={styles.comingSoonText}>
                  {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} tab content coming soon
                </Text>
              </View>
            );
        }
      })()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  monthText: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
  },
  navButton: {
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  tabButton: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    marginHorizontal: width * 0.01,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },
  selectedTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: width * 0.035,
    color: "#555",
  },
  selectedTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  otherTabContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.6,
  },
  comingSoonText: {
    fontSize: 18,
    color: "#555",
  },
});

export default StatsPage;
