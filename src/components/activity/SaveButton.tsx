import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../newemoji/utils";

interface SaveButtonProps {
  onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  const [savePressed, setSavePressed] = useState(false);

  return (
    <LinearGradient
      colors={["#32B768", "#27A35A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.saveGradient, savePressed && styles.saveButtonPressed]}
    >
      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSave}
        onPressIn={() => setSavePressed(true)}
        onPressOut={() => setSavePressed(false)}
        activeOpacity={0.9}
      >
        <Ionicons name="checkmark" size={wp(8)} color="#fff" />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  saveGradient: {
    borderRadius: wp(10),
    marginTop: hp(4),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: wp(5),
    color: "#fff",
    marginLeft: wp(2),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
  },
});

export default SaveButton;
