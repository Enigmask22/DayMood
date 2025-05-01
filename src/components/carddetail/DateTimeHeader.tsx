import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "@/components/newemoji/utils";

interface DateTimeHeaderProps {
  dayName: string;
  dayNumber: string;
  monthName: string;
  formattedTime: string;
  onSubmit: () => void;
  onEdit?: () => void;
}

const DateTimeHeader: React.FC<DateTimeHeaderProps> = ({
  dayName,
  dayNumber,
  monthName,
  formattedTime,
  onSubmit,
  onEdit,
}) => {
  const [submitPressed, setSubmitPressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={["#E0F7ED", "#B9F0DA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.buttonGradient, submitPressed && styles.buttonPressed]}
      >
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          onPressIn={() => setSubmitPressed(true)}
          onPressOut={() => setSubmitPressed(false)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={wp(6)} color="#32B768" />
        </TouchableOpacity>
      </LinearGradient>

      <LinearGradient
        colors={["#D5F7E5", "#E8F9F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dateTimeContainer}
      >
        <View style={styles.dateRow}>
          <MaterialCommunityIcons
            name="calendar-month"
            size={wp(4.5)}
            color="#32B768"
          />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dayName}>{dayName}</Text>
            <View style={styles.dateDetails}>
              <Text style={styles.dayNumber}>{dayNumber}</Text>
              <Text style={styles.monthName}>{monthName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.timeRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={wp(4.5)}
            color="#32B768"
          />
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
      </LinearGradient>

      {onEdit && (
        <LinearGradient
          colors={["#E0F7ED", "#B9F0DA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.buttonGradient, editPressed && styles.buttonPressed]}
        >
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            onPressIn={() => setEditPressed(true)}
            onPressOut={() => setEditPressed(false)}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={wp(5)} color="#32B768" />
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  buttonGradient: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.2)",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderColor: "rgba(50, 183, 104, 0.4)",
  },
  submitButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeContainer: {
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: wp(50),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.6),
    width: "100%",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dateTextContainer: {
    marginLeft: wp(2),
    flex: 1,
  },
  dayName: {
    fontSize: wp(3),
    color: "#333",
    fontFamily: "Quicksand-SemiBold",
    textTransform: "uppercase",
  },
  dateDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayNumber: {
    fontSize: wp(4),
    color: "#32B768",
    fontFamily: "Quicksand-Bold",
    marginRight: wp(1),
  },
  monthName: {
    fontSize: wp(3),
    color: "#555",
    fontFamily: "Quicksand-Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(50, 183, 104, 0.2)",
    width: "100%",
    marginVertical: hp(0.5),
  },
  timeText: {
    fontSize: wp(4.2),
    color: "#333",
    fontFamily: "Quicksand-Bold",
    marginLeft: wp(2),
  },
});

export default DateTimeHeader;
