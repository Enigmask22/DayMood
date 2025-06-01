import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { wp, hp } from "@/components/newemoji/utils";

const { width, height } = Dimensions.get("window");

interface CustomAlertProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }>;
  onClose: () => void;
  autoDismiss?: boolean;
  autoDismissTime?: number;
  tapToDismiss?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onClose,
  autoDismiss = false,
  autoDismissTime = 2000,
  tapToDismiss = false,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss functionality
      if (autoDismiss) {
        const timer = setTimeout(() => {
          onClose();
        }, autoDismissTime);

        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, autoDismiss, autoDismissTime]);

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "check-circle", color: "#10B981", bgColor: "#ECFDF5" };
      case "error":
        return {
          icon: "exclamation-circle",
          color: "#EF4444",
          bgColor: "#FEF2F2",
        };
      case "warning":
        return {
          icon: "exclamation-triangle",
          color: "#F59E0B",
          bgColor: "#FFFBEB",
        };
      case "info":
        return { icon: "info-circle", color: "#3B82F6", bgColor: "#EFF6FF" };
      default:
        return { icon: "info-circle", color: "#6B7280", bgColor: "#F9FAFB" };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  if (!visible) return null;

  const handleOverlayPress = () => {
    if (tapToDismiss) {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.alertContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: bgColor }]}
              >
                <FontAwesome5 name={icon} size={wp(6)} color={color} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {!autoDismiss && (
                <View style={styles.buttonContainer}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        button.style === "cancel" && styles.cancelButton,
                        button.style === "destructive" &&
                          styles.destructiveButton,
                        buttons.length === 1 && styles.singleButton,
                      ]}
                      onPress={() => {
                        button.onPress?.();
                        onClose();
                      }}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          button.style === "cancel" && styles.cancelButtonText,
                          button.style === "destructive" &&
                            styles.destructiveButtonText,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  alertContainer: {
    backgroundColor: "white",
    borderRadius: wp(4),
    padding: wp(6),
    width: "100%",
    maxWidth: wp(80),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(5),
    fontFamily: "Quicksand-Bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: hp(1),
  },
  message: {
    fontSize: wp(3.8),
    fontFamily: "Quicksand-Medium",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: wp(5.5),
    marginBottom: hp(3),
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: wp(3),
  },
  button: {
    flex: 1,
    backgroundColor: "#32B768",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  destructiveButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    fontSize: wp(4),
    fontFamily: "Quicksand-SemiBold",
    color: "white",
  },
  cancelButtonText: {
    color: "#6B7280",
  },
  destructiveButtonText: {
    color: "white",
  },
});

export default CustomAlert;
