import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CalendarHeaderProps {
  todayString: string;
  onAddPress: () => void;
}

const CalendarHeader = ({ todayString, onAddPress }: CalendarHeaderProps) => {
  return (
    <>
      <View style={styles.header}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color="#000"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.headerText}>Calendar</Text>
      </View>
      <View style={styles.rowBox}>
        <Text style={styles.dateText}>{todayString}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addText}>ADD</Text>
          <Ionicons
            name="add"
            size={22}
            color="#79BF5D"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  rowBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: "space-between",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: "black",
    fontWeight: "500",
    opacity: 0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addText: {
    fontSize: 18,
    color: "#79BF5D",
    fontWeight: "bold",
    marginRight: 2,
  },
});

export default CalendarHeader;
