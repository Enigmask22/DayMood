import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp } from "./utils";

interface ActionButtonsProps {
  onBack: () => void;
  onSave: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onBack, onSave }) => {
  return (
    <View style={styles.actionButtonContainer}>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.circleButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={wp(8)} color="white" />
        </TouchableOpacity>
        <Text style={styles.buttonLabel}>Back</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.circleButton} onPress={onSave}>
          <Ionicons name="checkmark" size={wp(8)} color="white" />
        </TouchableOpacity>
        <Text style={styles.buttonLabel}>Save</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ActionButtons;
