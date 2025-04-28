import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { wp, hp } from "./utils";

interface ActivityButtonProps {
  onPress?: () => void;
}

const ActivityButton: React.FC<ActivityButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.activityButton} onPress={onPress}>
      <Text style={styles.activityButtonText}>Select your activity</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default ActivityButton;
