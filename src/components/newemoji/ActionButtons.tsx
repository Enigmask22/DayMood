import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp } from "./utils";
import { LinearGradient } from "expo-linear-gradient";

interface ActionButtonsProps {
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onSave,
  isLoading = false,
}) => {
  const [backPressed, setBackPressed] = useState(false);
  const [savePressed, setSavePressed] = useState(false);

  return (
    <View style={styles.actionButtonContainer}>
      <View style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#2AAB73", "#1E8F5E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientButton, backPressed && styles.buttonPressed]}
        >
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={wp(8)} color="white" />
          </TouchableOpacity>
        </LinearGradient>
        <Text style={styles.buttonLabel}>Back</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#2AAB73", "#1E8F5E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientButton,
            savePressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onSave}
            onPressIn={() => setSavePressed(true)}
            onPressOut={() => setSavePressed(false)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Ionicons name="checkmark" size={wp(8)} color="white" />
            )}
          </TouchableOpacity>
        </LinearGradient>
        <Text style={styles.buttonLabel}>
          {isLoading ? "Saving..." : "Save"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: hp(5),
    marginBottom: hp(2),
  },
  buttonWrapper: {
    alignItems: "center",
  },
  gradientButton: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(9),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  circleButton: {
    width: "100%",
    height: "100%",
    borderRadius: wp(9),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: "#333",
    fontSize: wp(4.2),
    fontFamily: "Quicksand-Bold",
    marginTop: hp(0.5),
  },
});

export default ActionButtons;
