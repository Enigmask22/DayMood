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
import StreakRow from "@/components/statspage/StreakRow";
import ActivityChart from "@/components/statistics/ActivityChart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/utils/config";
import { useFocusEffect } from "expo-router";

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
  const [moodStats, setMoodStats] = useState<any[]>([]); // dailyMoodStats
  const [loading, setLoading] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakRow, setStreakRow] = useState<
    ("empty" | "check" | "plus" | "bookmark" | "rect")[]
  >(["plus", "plus", "plus", "plus", "bookmark"]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedTab !== "general") return;
      const fetchMoodStats = async () => {
        setLoading(true);
        try {
          const user = await AsyncStorage.getItem("user");
          if (!user) return;
          const userData = JSON.parse(user);
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const res = await fetch(
            `${API_URL}/api/v1/records/statistic/mood?user_id=${userData.id}&month=${month}&year=${year}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await res.json();
          const dailyStats = data?.data?.monthly?.dailyMoodStats || [];
          setMoodStats(dailyStats);

          // Calculate longest streak from start of month up to and including today
          let maxStreak = 0,
            curStreak = 0;
          const start = new Date(year, month - 1, 1);
          const realToday = new Date();
          const isCurrentMonth =
            realToday.getFullYear() === year &&
            realToday.getMonth() + 1 === month;
          const lastDay = isCurrentMonth
            ? realToday.getDate()
            : new Date(year, month, 0).getDate();
          for (let i = 0; i < lastDay; i++) {
            const d = new Date(year, month - 1, 1 + i);
            const dateStr = d.toISOString().slice(0, 10);
            const found = dailyStats.find((ds: any) => ds.date === dateStr);
            if (found && found.totalRecords > 0) {
              curStreak++;
              if (curStreak > maxStreak) maxStreak = curStreak;
            } else {
              curStreak = 0;
            }
          }
          // Check today
          const todayDate = new Date(year, month - 1, lastDay);
          const todayStr = todayDate.toISOString().slice(0, 10);
          const todayFound = dailyStats.find((ds: any) => ds.date === todayStr);
          if (todayFound && todayFound.totalRecords > 0) {
            curStreak++;
            if (curStreak > maxStreak) maxStreak = curStreak;
          } else {
            curStreak = 0;
          }
          setLongestStreak(maxStreak);

          // Prepare streak row (4 previous days + today as yellow)
          let streakArr: ("empty" | "check" | "plus" | "bookmark" | "rect")[] =
            [];
          for (let i = 3; i >= 0; i--) {
            let d = new Date(
              realToday.getFullYear(),
              realToday.getMonth(),
              realToday.getDate() - i
            );
            if (d.getMonth() + 1 !== month || d > realToday) {
              streakArr.push("empty");
              continue;
            }
            const dateStr = d.toISOString().slice(0, 10);
            const found = dailyStats.find((ds: any) => ds.date === dateStr);
            streakArr.push(found && found.totalRecords > 0 ? "check" : "plus");
          }
          // Today (yellow)
          streakArr.push("bookmark");
          // Rectangle (visual only)
          streakArr.push("rect");
          setStreakRow(streakArr);
        } catch (e) {
          setMoodStats([]);
          setStreakRow(["plus", "plus", "plus", "plus", "bookmark"] as (
            | "empty"
            | "check"
            | "plus"
            | "bookmark"
          )[]);
          setLongestStreak(0);
        } finally {
          setLoading(false);
        }
      };
      fetchMoodStats();
    }, [currentDate, selectedTab])
  );

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
        <TouchableOpacity
          onPress={handlePreviousMonth}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(currentDate, "MMMM, yyyy")}
        </Text>
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
          case "emotion":
            return (
              <EmotionPage
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            );
          case "general":
            return (
              <View style={styles.generalTabContent}>
                <StreakRow streak={streakRow} longestStreak={longestStreak} />
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <View style={styles.contentContainer}>
                    <ActivityChart
                      activities={[]}
                      currentMonth={currentDate}
                      hasRealData={false}
                    />
                  </View>
                </ScrollView>
              </View>
            );
          case "activity":
            return (
              <ActivityPage
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            );
          default:
            return (
              <View style={styles.otherTabContent}>
                <Text style={styles.comingSoonText}>
                  {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}{" "}
                  tab content coming soon
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
  generalTabContent: {
    flex: 1,
    paddingTop: 10,
  },
});

export default StatsPage;
