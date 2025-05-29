import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface StreakRowProps {
  streak: ("check" | "plus" | "bookmark" | "empty" | "rect")[];
  longestStreak: number;
}

const iconMap = {
  check: <Ionicons name="checkmark" size={20} color="#22C55E" />,
  plus: <Ionicons name="add" size={20} color="#22C55E" />,
  bookmark: <MaterialIcons name="bookmark-border" size={20} color="#FCA10C" />,
  empty: null,
};

const StreakRow: React.FC<StreakRowProps> = ({ streak, longestStreak }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Days in Row</Text>
    <View style={styles.row}>
      {streak.map((type, idx) => (
        <React.Fragment key={idx}>
          {type === "rect" ? (
            <View style={styles.rectBox} />
          ) : (
            <View
              style={[
                styles.circle,
                type === "bookmark" && styles.bookmarkCircle,
                type === "empty" && styles.emptyCircle,
              ]}
            >
              {iconMap[type]}
            </View>
          )}
          {idx < streak.length - 1 && <View style={styles.connector} />}
        </React.Fragment>
      ))}
    </View>
    <Text style={styles.streakText}>Longest streak: {longestStreak}</Text>
  </View>
);

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
    fontWeight: "600",
    fontSize: 24,
    marginBottom: 8,
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
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  bookmarkCircle: {
    borderColor: "#FCA10C",
  },
  emptyCircle: {
    backgroundColor: "#E5E5E5",
    borderColor: "#E5E5E5",
  },
  connector: {
    width: 14,
    height: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 0,
  },
  rectBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
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
