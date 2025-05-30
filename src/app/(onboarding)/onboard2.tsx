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
  Animated,
  PanResponder,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { APP_COLOR } from "src/utils/constant";

const { width } = Dimensions.get("window");

const OnboardScreen2 = () => {
  const router = useRouter();
  const pan = new Animated.ValueXY();

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.x.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Vuốt sang trái -> chuyển đến onboard3
          router.push("/onboard3");
        } else if (gestureState.dx > 50) {
          // Vuốt sang phải -> quay lại màn hình trước
          router.back();
        }
        // Reset vị trí về 0
        Animated.spring(pan.x, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const handleSkip = () => {
    router.push("/(auth)/login"); // Điều hướng sang onboard3
  };

  const handleNext = () => {
    router.push("/onboard3"); // Điều hướng sang onboard3
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Thay thế bằng hình ảnh và nội dung của bạn cho Onboard 2 */}
        <Image
          source={require("@/assets/images/onboard/onboard2.png")} // Placeholder image
          style={styles.image}
          resizeMode="contain" // Hoặc "cover" tùy ảnh
        />
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            Record your feeling inside a diary!
          </Text>
          <Text style={styles.subtitleText}>
            Explore a new way to make diary with photo and audio attachments.
          </Text>
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationWrapper}>
            <View style={[styles.paginationDot, styles.inactiveDot]} />
            <View style={styles.paginationDot} />
            <View style={[styles.paginationDot, styles.inactiveDot]} />
          </View>
        </View>

        <View style={styles.navContainer}>
          {/* Nút Skip */}
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Nút Next */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// --- Style tương tự Onboard 1 ---
// Bạn có thể tách styles ra file riêng nếu muốn dùng chung
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
    height: width - 34, // Điều chỉnh nếu cần tỷ lệ khác
    alignSelf: "center",
    // marginBottom: 33, // Thêm khoảng cách nếu cần
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 33,
  },
  titleText: {
    // Đổi tên từ welcomeText cho rõ nghĩa hơn
    fontFamily: "Poppins-Bold",
    fontSize: 24, // Có thể điều chỉnh font size
    textAlign: "center",
    lineHeight: 32, // Điều chỉnh line height
    marginBottom: 12, // Khoảng cách với subtitle
  },
  subtitleText: {
    fontFamily: "Inter-Light",
    fontSize: 18, // Điều chỉnh font size
    color: "#666666",
    // marginTop: 12, // Đã có margin bottom ở title
    textAlign: "center",
    paddingHorizontal: 20, // Thêm padding để text không quá dài
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
    backgroundColor: APP_COLOR.ONBOARDING, // Màu xanh iOS
  },
  inactiveDot: {
    backgroundColor: "#D9D9D9",
  },
  button: {
    backgroundColor: APP_COLOR.ONBOARDING, // Màu xanh iOS
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 10,
  },
  skipText: {
    fontFamily: "Inter-Light",
    fontSize: 16,
    color: "#666666",
    marginLeft: 10,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: APP_COLOR.ONBOARDING, // Màu xanh iOS
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OnboardScreen2;
