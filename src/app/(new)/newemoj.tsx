import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Animated,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import MoodSelector from "@/components/newemoji/MoodSelector";
import ActivityButton from "@/components/newemoji/ActivityButton";
import SelectedEmoji from "@/components/newemoji/SelectedEmoji";
import ActionButtons from "@/components/newemoji/ActionButtons";
import Header from "@/components/newemoji/Header";
import { wp, hp } from "@/components/newemoji/utils";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

// Custom Alert Component
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
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onClose,
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
  }, [visible]);

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

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[customAlertStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            customAlertStyles.alertContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[
              customAlertStyles.iconContainer,
              { backgroundColor: bgColor },
            ]}
          >
            <FontAwesome5 name={icon} size={wp(6)} color={color} />
          </View>

          <Text style={customAlertStyles.title}>{title}</Text>
          <Text style={customAlertStyles.message}>{message}</Text>

          <View style={customAlertStyles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  customAlertStyles.button,
                  button.style === "cancel" && customAlertStyles.cancelButton,
                  button.style === "destructive" &&
                    customAlertStyles.destructiveButton,
                  buttons.length === 1 && customAlertStyles.singleButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text
                  style={[
                    customAlertStyles.buttonText,
                    button.style === "cancel" &&
                      customAlertStyles.cancelButtonText,
                    button.style === "destructive" &&
                      customAlertStyles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Map mood IDs to titles
const moodTitles: { [key: number]: string } = {
  1: "Not feeling good today",
  2: "I'm feeling angry",
  3: "Just an ordinary day",
  4: "It's a good day",
  5: "Today is so good",
};

export default function NewEmojiScreen() {
  // Lấy tham số initialDate từ URL
  const params = useLocalSearchParams();
  const { initialDate } = params;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  // Sử dụng initialDate nếu có, nếu không thì sử dụng ngày hiện tại
  const [date, setDate] = useState<Date>(() => {
    if (initialDate && typeof initialDate === "string") {
      return new Date(initialDate);
    }
    return new Date();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [{ text: "OK", style: "default" }],
  });

  // Helper function to show custom alert
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Cập nhật date khi initialDate thay đổi
  useEffect(() => {
    if (initialDate && typeof initialDate === "string") {
      setDate(new Date(initialDate));
    }
  }, [initialDate]);

  const handleSelectMood = (id: number) => {
    setSelectedMood(id);
  };

  const handleSave = async () => {
    // Kiểm tra xem mood đã được chọn hay chưa
    if (!selectedMood) {
      showAlert("warning", "Notice", "Please select a mood before saving");
      return;
    }

    try {
      setIsLoading(true);

      // Lấy title từ moodTitles dựa vào selectedMood
      const moodTitle = moodTitles[selectedMood] || "How I feel today";
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        throw new Error("User information not found in AsyncStorage");
      }
      // Chuẩn bị dữ liệu gửi đi với title từ mood
      const recordData = {
        date: date.toISOString(),
        mood_id: selectedMood,
        user_id: JSON.parse(user || "{}").id || DEFAULT_USER_ID,
        status: "ACTIVE",
        title: moodTitle, // Thêm title dựa vào mood
      };

      console.log("Gửi dữ liệu:", recordData);

      // Gọi API để lưu record
      const response = await fetch(API_ENDPOINTS.RECORDS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error saving data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Kết quả từ API:", result);

      // Hiển thị thông báo thành công
      showAlert("success", "Success", "Mood saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            //router.back();
            router.push("/(main)" as any);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      showAlert("error", "Error", `Unable to save data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to main screen if back navigation fails
      router.push("/(main)" as any);
    }
  };

  // Xử lý khi nhấn nút chọn hoạt động
  const handleSelectActivities = () => {
    // Điều hướng đến trang activity với params là mood và date
    try {
      router.push({
        pathname: "/(new)/activity" as any,
        params: {
          initialDate: date.toISOString(),
          selectedMood: selectedMood?.toString(),
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Header title="How are you?" />
          <DateTimeSelector date={date} setDate={setDate} />
          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
          />
          <ActivityButton onPress={handleSelectActivities} />
          <SelectedEmoji selectedMood={selectedMood} />
          <ActionButtons
            onBack={handleBack}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const customAlertStyles = StyleSheet.create({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7ED",
    paddingTop: hp(2),
  },
  content: {
    flex: 1,
    padding: wp(5),
    alignItems: "center",
  },
});
