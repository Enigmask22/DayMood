import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../newemoji/utils";

interface SaveButtonProps {
  onSave: () => void;
  isLoading?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isLoading = false,
}) => {
  const [savePressed, setSavePressed] = useState(false);

  return (
    <LinearGradient
      colors={isLoading ? ["#9CA3AF", "#6B7280"] : ["#32B768", "#27A35A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.saveGradient,
        savePressed && styles.saveButtonPressed,
        isLoading && styles.saveButtonDisabled,
      ]}
    >
      <TouchableOpacity
        style={styles.saveButton}
        onPress={isLoading ? undefined : onSave}
        onPressIn={isLoading ? undefined : () => setSavePressed(true)}
        onPressOut={isLoading ? undefined : () => setSavePressed(false)}
        activeOpacity={isLoading ? 1 : 0.9}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={wp(6)} color="#fff" />
        ) : (
          <Ionicons name="checkmark" size={wp(8)} color="#fff" />
        )}
        <Text
          style={[
            styles.saveButtonText,
            isLoading && styles.saveButtonTextDisabled,
          ]}
        >
          {isLoading ? "Saving..." : "Save"}
        </Text>
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
  saveButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: wp(5),
    color: "#fff",
    marginLeft: wp(2),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
  },
  saveButtonTextDisabled: {
    opacity: 0.8,
  },
});

export default SaveButton;
