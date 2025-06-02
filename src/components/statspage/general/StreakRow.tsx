import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface StreakRowProps {
  streak: ("check" | "plus" | "bookmark" | "empty")[];
  longestStreak: number;
  streakDates?: Date[]; // Optional array of dates corresponding to streak icons
}

const iconMap = {
  check: <Ionicons name="checkmark" size={20} color="#fff" />,
  plus: <Ionicons name="add" size={20} color="#22C55E" />, // Default green color
  plusToday: <Ionicons name="add" size={20} color="#FCA10C" />, // Orange color for today
  bookmark: <MaterialIcons name="bookmark-border" size={20} color="#fff" />, // White for orange background
  empty: null,
};

const StreakRow: React.FC<StreakRowProps> = ({ streak, longestStreak, streakDates = [] }) => {
  const router = useRouter();

  const handlePlusIconPress = (index: number) => {
    // Get the date for this index if available
    const dateForIcon = streakDates[index];
    if (dateForIcon) {
      router.navigate({
        pathname: "(new)/newemoj" as any,
        params: { initialDate: dateForIcon.toISOString() },
      });
    }
  };

  const isToday = (index: number) => {
    if (!streakDates[index]) return false;
    const today = new Date();
    const checkDate = streakDates[index];
    return today.toDateString() === checkDate.toDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood streak</Text>
      <Text style={styles.subtitle}>Your recent mood records past 5 days</Text>      
      <View style={styles.row}>
        {streak.map((type, idx) => (
          <React.Fragment key={idx}>
            {type === "plus" ? (
              <TouchableOpacity
                style={[
                  styles.uncheckedCircle,
                  styles.plusCircle,
                  isToday(idx) && styles.todayCircle,
                ]}
                onPress={() => handlePlusIconPress(idx)}
                activeOpacity={0.7}
              >
                {isToday(idx) ? iconMap.plusToday : iconMap.plus}
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.uncheckedCircle,
                  type === "bookmark" && styles.bookmarkCircle,
                  type === "empty" && styles.emptyCircle,
                  type === "check" && styles.checkedCircle,
                  isToday(idx) && type !== "empty" && styles.todayCircle,
                ]}
              >
                {iconMap[type]}
              </View>
            )}
            {idx < streak.length - 1 && <View style={styles.connector} />}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.streakText}>Longest streak this month: {longestStreak} {longestStreak > 1 ? "days" : "day"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontFamily: "Quicksand-Bold",
    fontSize: 24,
    marginBottom: 8,
    color: "#222",
    alignSelf: "center",
  },
  subtitle: {
    fontWeight: "400",
    fontSize: 12,
    marginBottom: 15,
    color: "#222",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  uncheckedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#22C55E",
  },  bookmarkCircle: {
    borderColor: "#FCA10C",
    backgroundColor: "#FCA10C",
  },emptyCircle: {
    backgroundColor: "#E5E5E5",
    borderColor: "#E5E5E5",
  },  plusCircle: {
    // Style for touchable plus icons
  },  todayCircle: {
    borderWidth: 3,
    borderColor: "#FCA10C",
    // No background color - this will be determined by the circle type
  },
  connector: {
    width: 14,
    height: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 0,
  },
  streakText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "400",
    marginTop: 4,
    alignSelf: "center",
  },
});

export default StreakRow;
