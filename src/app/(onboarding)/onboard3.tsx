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
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment nếu dùng AsyncStorage

const { width } = Dimensions.get("window");

const OnboardScreen3 = () => {
  const router = useRouter();

  const handleFinish = async () => {
    try {
      // Lưu trạng thái đã hoàn thành onboarding (tuỳ chọn)
      // await AsyncStorage.setItem('@onboarding_complete', 'true');

      // Điều hướng đến màn hình chính và xoá stack onboarding
      router.replace("/(main)" as any);
    } catch (e) {
      // Xử lý lỗi nếu có
      console.error("Failed to save onboarding status or navigate:", e);
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
          <Text style={styles.titleText}>Sẵn sàng trải nghiệm!</Text>
          <Text style={styles.subtitleText}>
            Bắt đầu hành trình cải thiện tâm trạng mỗi ngày cùng DayMood.
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
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.iPhoneIndicator}>
        <View style={styles.indicatorLine} />
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  subtitleText: {
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
    backgroundColor: "#007AFF",
  },
  inactiveDot: {
    backgroundColor: "#D9D9D9",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  iPhoneIndicator: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorLine: {
    width: 135,
    height: 5,
    backgroundColor: "#B9C0C9",
    borderRadius: 100,
  },
});

export default OnboardScreen3;
