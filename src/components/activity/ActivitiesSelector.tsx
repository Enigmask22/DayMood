import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { wp, hp } from "../newemoji/utils";
import { ACTIVITIES } from "@/utils/constant";
// Định nghĩa các hoạt động (loại bỏ nút "More" khỏi danh sách các activity có thể chọn)
const activities = ACTIVITIES.filter((activity) => activity.id !== 16);
const moreButton = ACTIVITIES.find((activity) => activity.id === 16);

interface ActivitiesSelectorProps {
  selectedActivities: number[];
  onActivitySelect: (activityId: number) => void;
}

const ActivitiesSelector: React.FC<ActivitiesSelectorProps> = ({
  selectedActivities,
  onActivitySelect,
}) => {
  const handleMorePress = () => {
    console.log(
      "More button pressed - functionality will be implemented later"
    );
    // Hiện tại chỉ hiển thị console log theo yêu cầu
  };

  return (
    <View style={styles.activitiesSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>ACTIVITIES</Text>
        <View style={styles.sectionTitleLine} />
      </View>
      <View style={styles.activitiesGrid}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityItem,
              selectedActivities.includes(activity.id) &&
                styles.selectedActivity,
            ]}
            onPress={() => onActivitySelect(activity.id)}
          >
            <FontAwesome5
              name={activity.icon}
              size={wp(5)}
              color={
                selectedActivities.includes(activity.id) ? "#006400" : "#fff"
              }
            />
            <Text
              style={[
                styles.activityName,
                selectedActivities.includes(activity.id) &&
                  styles.selectActivitiesText,
              ]}
            >
              {activity.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Nút More đặc biệt */}
        {moreButton && (
          <TouchableOpacity
            key="more-button"
            style={[styles.activityItem, styles.moreButton]}
            onPress={handleMorePress}
          >
            <FontAwesome5 name={moreButton.icon} size={wp(5)} color="#fff" />
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.selectActivitiesContainer}>
        <View style={styles.selectActivitiesArrow} />
        <Text style={styles.selectActivitiesText}>
          Select your activities ...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activitiesSection: {
    marginTop: hp(0.5),
  },
  sectionTitleContainer: {
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontFamily: "Inter-ExtraBold",
    letterSpacing: 1.5,
    color: "#333",
  },
  sectionTitleLine: {
    width: wp(30),
    height: hp(0.3),
    backgroundColor: "#333",
    marginTop: hp(0.5),
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#00A67E",
    borderRadius: wp(4),
    padding: wp(3.5),
    paddingVertical: hp(1.5),
    height: hp(45), // Giữ chiều cao cố định để tránh thay đổi kích thước khi chọn hoạt động
  },
  activityItem: {
    width: "22%", // Để 4 items mỗi hàng với một chút khoảng cách
    aspectRatio: 0.7, // Hơi bẹt xuống 1 chút để giảm chiều cao tổng thể
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.2),
    marginHorizontal: wp(0.5),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  selectedActivity: {
    backgroundColor: "#A3E635", // Màu xanh lá nhạt hơn, gần với thiết kế
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  moreButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Màu nền hơi khác để phân biệt
  },
  activityName: {
    fontSize: wp(2.8),
    color: "#fff",
    marginTop: hp(0.5),
    textAlign: "center",
    fontFamily: "Quicksand-Regular",
  },
  selectActivitiesText: {
    fontSize: wp(2.8),
    color: "#888",
    marginTop: hp(0.5),
    textAlign: "center",
    fontFamily: "Quicksand-Regular",
  },
  selectActivitiesContainer: {
    backgroundColor: "white",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(6),
    borderRadius: wp(10),
    marginTop: hp(1.5),
    position: "relative",
    alignSelf: "center",
    width: "65%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectActivitiesArrow: {
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
});

export default ActivitiesSelector;
