import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomCalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onPrevPress: () => void;
  onNextPress: () => void;
  onMonthPress: () => void;
  onYearPress: () => void;
}

const CustomCalendarHeader = ({
  currentMonth,
  currentYear,
  onPrevPress,
  onNextPress,
  onMonthPress,
  onYearPress,
}: CustomCalendarHeaderProps) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
        paddingHorizontal: 8,
      }}
    >
      <TouchableOpacity
        onPress={onPrevPress}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E6EAF0",
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="chevron-back" size={22} color="#232B3A" />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity onPress={onMonthPress}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#232B3A",
              textAlign: "center",
            }}
          >
            {months[currentMonth]}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onYearPress}>
          <Text
            style={{
              fontSize: 16,
              color: "#AEB8C4",
              textAlign: "center",
              marginTop: 0,
            }}
          >
            {currentYear}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onNextPress}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E6EAF0",
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="chevron-forward" size={22} color="#232B3A" />
      </TouchableOpacity>
    </View>
  );
};

export default CustomCalendarHeader;
