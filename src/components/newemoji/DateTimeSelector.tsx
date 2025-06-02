import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp } from "./utils";

interface DateTimeSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  date,
  setDate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
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
    const dayInWeek = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    let daySuffix = "th";
    if (day === 1 || day === 21 || day === 31) daySuffix = "st";
    else if (day === 2 || day === 22) daySuffix = "nd";
    else if (day === 3 || day === 23) daySuffix = "rd";

    return `${dayInWeek}, ${day}${daySuffix} ${month}`;
  };
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Format with leading zeros for both hours and minutes
    const hoursFormatted = hours < 10 ? `0${hours}` : hours;
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

    return `${hoursFormatted}:${minutesFormatted}`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowTimePicker(false);
    setDate(currentDate);
  };

  return (
    <>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={wp(6)} color="#666" />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Ionicons name="chevron-down-outline" size={wp(5)} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeSelector}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={wp(6)} color="#666" />
          <Text style={styles.timeText}>{formatTime(date)}</Text>
          <Ionicons name="chevron-down-outline" size={wp(5)} color="#666" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          testID="timeTimePicker"
          value={date}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
          minuteInterval={1}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(90),
    marginBottom: hp(3),
  },
  dateSelector: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
    width: wp(58),
  },
  timeSelector: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
    width: wp(30),
  },
  dateText: {
    fontSize: wp(3.5),
    color: "#333",
    fontWeight: "500",
    flex: 1,
    marginLeft: wp(2),
  },
  timeText: {
    fontSize: wp(3.5),
    color: "#333",
    fontWeight: "500",
    flex: 1,
    marginLeft: wp(2),
  },
});

export default DateTimeSelector;
