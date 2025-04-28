import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moods } from "@/utils/constant"; // Importing the moods array from constants
import { moodIdAsyncStorageKey } from "@/utils/constant";

const { width, height } = Dimensions.get("window");

// Hàm tiện ích để tính toán kích thước dựa trên chiều rộng màn hình
const wp = (percentage: number) => {
  const value = (percentage * width) / 100;
  return Math.round(value);
};

// Hàm tiện ích để tính toán kích thước dựa trên chiều cao màn hình
const hp = (percentage: number) => {
  const value = (percentage * height) / 100;
  return Math.round(value);
};



export default function NewEmojiScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
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

    const day = date.getDate();
    const month = months[date.getMonth()];

    let daySuffix = "th";
    if (day === 1 || day === 21 || day === 31) daySuffix = "st";
    else if (day === 2 || day === 22) daySuffix = "nd";
    else if (day === 3 || day === 23) daySuffix = "rd";

    return `Today, ${day}${daySuffix} ${month}`;
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'

    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutesFormatted}`;
  };

  const handleSelectMood = (id: number) => {
    setSelectedMood(id);
    AsyncStorage.setItem(moodIdAsyncStorageKey, JSON.stringify(id));
  };

  const handleSave = () => {
    // Xử lý lưu trạng thái mood
    // Thêm vào hệ thống lưu trữ tại đây
    router.back();
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>How are you?</Text>

          {/* Date and Time Selectors */}
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

          {/* DateTimePicker for Date */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          {/* DateTimePicker for Time */}
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

          {/* Moods Title */}
          <View style={styles.moodsTitleContainer}>
            <Text style={styles.moodsTitle}>MOODS</Text>
            <View style={styles.moodsTitleLine} />
          </View>

          {/* Mood Selection */}
          <View style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodItem,
                  selectedMood === mood.id && { backgroundColor: mood.color },
                ]}
                onPress={() => handleSelectMood(mood.id)}
              >
                <Image
                  source={mood.emoji}
                  style={styles.moodEmoji}
                  contentFit="contain"
                  autoplay={true}
                />
                <Text
                  style={[
                    styles.moodText,
                    selectedMood === mood.id && { color: "white" },
                  ]}
                >
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mood Selection Prompt */}
          <View style={styles.promptContainer}>
            <View style={styles.promptArrow} />
            <Text style={styles.promptText}>Select your mood ...</Text>
          </View>

          {/* Activity Selection Button */}
          <TouchableOpacity style={styles.activityButton} onPress={() => router.push("/(new)/newactivity")}>
            <Text style={styles.activityButtonText}>Select your activity</Text>
          </TouchableOpacity>

          {/* Selected Emoji Display */}
          <View style={styles.selectedEmojiContainer}>
            {selectedMood && (
              <Image
                source={moods.find((m) => m.id === selectedMood)?.emoji}
                style={styles.selectedEmoji}
                contentFit="contain"
                autoplay={true}
              />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonContainer}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={wp(8)} color="white" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Back</Text>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={wp(8)} color="white" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Save</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7ED",
  },
  content: {
    flex: 1,
    padding: wp(5),
    alignItems: "center",
  },
  title: {
    fontSize: wp(7),
    fontWeight: "600",
    marginTop: hp(2),
    marginBottom: hp(3),
    color: "#333",
  },
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
  moodsTitleContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp(2),
  },
  moodsTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#333",
  },
  moodsTitleLine: {
    width: wp(15),
    height: hp(0.3),
    backgroundColor: "#333",
    marginTop: hp(0.5),
  },
  moodContainer: {
    flexDirection: "row",
    backgroundColor: "#11A050",
    borderRadius: wp(5),
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    justifyContent: "space-between",
    width: wp(90),
    marginBottom: hp(0.8),
  },
  moodItem: {
    alignItems: "center",
    padding: wp(1),
    borderRadius: wp(2),
  },
  moodEmoji: {
    width: wp(10),
    height: wp(10),
  },
  moodText: {
    fontSize: wp(3),
    marginTop: hp(0.5),
    color: "white",
    fontWeight: "500",
  },
  promptContainer: {
    backgroundColor: "white",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
    marginVertical: hp(1),
    position: "relative",
    marginTop: hp(1),
  },
  promptArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: wp(2.5),
    borderRightWidth: wp(2.5),
    borderBottomWidth: wp(2.5),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    position: "absolute",
    top: -wp(2.5),
    alignSelf: "center",
  },
  promptText: {
    fontSize: wp(4),
    color: "#888",
  },
  activityButton: {
    backgroundColor: "#E9FFCB",
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderRadius: wp(10),
    marginVertical: hp(2),
  },
  activityButtonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#333",
  },
  selectedEmojiContainer: {
    marginVertical: hp(2),
    height: wp(30),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedEmoji: {
    width: wp(25),
    height: wp(25),
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  buttonWrapper: {
    alignItems: "center",
  },
  circleButton: {
    backgroundColor: "#11A050",
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  buttonLabel: {
    color: "black",
    fontSize: wp(4),
    fontWeight: "bold",
  },
});
