import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { APP_COLOR } from "frontend/src/utils/constant";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Bỏ comment dòng này

const { width } = Dimensions.get("window");

const OnboardScreen3 = () => {
  const router = useRouter();

  const handleFinish = async () => {
    try {
      // Lưu trạng thái đã hoàn thành onboarding
      await AsyncStorage.setItem("hasCompletedOnboarding", "true"); // Thay đổi key và bỏ comment

      // Điều hướng đến màn hình chính và xoá stack onboarding
      router.replace("/(main)"); // Xoá "as any" nếu không cần thiết
    } catch (e) {
      // Xử lý lỗi nếu có
      console.error("Failed to save onboarding status or navigate:", e);
      // Cân nhắc hiển thị thông báo lỗi cho người dùng ở đây
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        {/* Thay thế bằng hình ảnh và nội dung của bạn cho Onboard 3 */}
        <Image
          source={require("@/assets/images/onboard/onboard3.png")} // Placeholder image
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>See through your emotion </Text>
          <Text style={styles.subtitleText}>
            With statistical charts, we will offer some features such as advice,
            music,... to help improve your mood
          </Text>
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationWrapper}>
            <View style={[styles.paginationDot, styles.inactiveDot]} />
            <View style={[styles.paginationDot, styles.inactiveDot]} />
            <View style={styles.paginationDot} />
          </View>
        </View>

        {/* Nút Finish */}
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Style tương tự Onboard 1 & 2 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 17,
    marginTop: 64,
  },
  image: {
    width: width - 34,
    height: width - 34,
    alignSelf: "center",
    // marginBottom: 33,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 33,
  },
  titleText: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  subtitleText: {
    fontFamily: "Inter-Light",
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  paginationContainer: {
    marginTop: "auto",
    marginBottom: 33,
  },
  paginationWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_COLOR.ONBOARDING,
  },
  inactiveDot: {
    backgroundColor: "#D9D9D9",
  },
  button: {
    backgroundColor: APP_COLOR.ONBOARDING,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20, // Thêm padding ngang để button không quá sát text
    alignItems: "center",
    marginBottom: 10,
    minWidth: 200, // Đảm bảo button có chiều rộng tối thiểu
    alignSelf: "center", // Căn giữa button theo chiều ngang
  },
  buttonText: {
    fontFamily: "Inter-ExtraBold",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardScreen3;
