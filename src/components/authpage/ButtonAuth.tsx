import { PropsWithChildren } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

// title: string
const ButtonAuth = ({
  children,
  title,
  onPress,
  isLoading = false,
}: PropsWithChildren & {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonBox, isLoading && styles.buttonBoxDisabled]}
      onPress={isLoading ? undefined : onPress}
      disabled={isLoading}
      activeOpacity={isLoading ? 1 : 0.7}
    >
      {isLoading && (
        <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
      )}
      <Text style={[styles.buttonText, isLoading && styles.buttonTextLoading]}>
        {isLoading ? "Signing up..." : title}
      </Text>
    </TouchableOpacity>
  );
};

export default ButtonAuth;

const styles = StyleSheet.create({
  buttonBox: {
    width: width * 0.7,
    height: height * 0.06,
    backgroundColor: "#47B069",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 40,
  },
  buttonBoxDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.8,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  buttonTextLoading: {
    marginLeft: 8,
  },
  spinner: {
    marginRight: 8,
  },
});
