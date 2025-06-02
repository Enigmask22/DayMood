import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths } from "date-fns";
import EmotionPage from "@/components/statspage/emotion";
import ActivityPage from "@/components/statspage/activity";
import GeneralPage from "@/components/statspage/general";
const { width, height } = Dimensions.get("window");

// Tab options
const tabs = [
  { id: "general", label: "General" },
  { id: "activity", label: "Activity" },
  { id: "emotion", label: "Emotion" },
];

const StatsPage = () => {
  const [selectedTab, setSelectedTab] = useState("general");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Function to handle month navigation
  const handlePreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  // Function to handle month navigation
  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {selectedTab !== "general" ? (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handlePreviousMonth}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {format(selectedDate, "MMMM, yyyy")}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>) : <Text style={styles.statisticsHeader}><Ionicons name="stats-chart" size={24}/> Statistics</Text>
      }

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.selectedTabButton,
              tab.id === "emotion"
                ? {
                  backgroundColor:
                    selectedTab === tab.id ? "#4CAF50" : "#f1f1f1",
                }
                : null,
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.selectedTabText,
                tab.id === "emotion" && selectedTab === tab.id
                  ? { color: "#FFFFFF" }
                  : null,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(() => {
        switch (selectedTab) {
          case "general":
            return (
              <GeneralPage
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onTabChange={setSelectedTab}
              />

            );
          case "activity":
            return (
              <ActivityPage
                currentDate={selectedDate}
                setCurrentDate={setSelectedDate}
              />
            );
          case "emotion":
            return (
              <EmotionPage
                currentDate={selectedDate}
                setCurrentDate={setSelectedDate}
                showMoodChartOnly={false}
              />
            );
          default:
            return (
              <View style={styles.otherTabContent}>
                <Text style={styles.comingSoonText}>
                  {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}{" "}
                  Coming soon
                </Text>
              </View>
            );
        }
      })()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    padding: 15,
  },
  contentContainer: {
    flex: 1,
    gap: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    paddingTop: height * 0.035,
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
    fontSize: width * 0.06,
    fontFamily: "Quicksand-Bold",
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
    borderColor: "#eee",
    borderWidth: 1,
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
  statisticsHeader: {
    fontSize: 24,
    fontFamily: "Quicksand-Bold",
    textAlign: "center",
    marginVertical: 22,
    color: "#333",
  },
});

export default StatsPage;
