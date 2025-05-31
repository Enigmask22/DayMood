import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { useRouter } from "expo-router";
import { APP_COLOR } from "src/utils/constant";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const { width } = Dimensions.get("window");

const OnboardScreen3 = () => {
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
      onPanResponderRelease: async (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Vuốt sang trái -> chuyển đến login
          try {
            await AsyncStorage.setItem("hasCompletedOnboarding", "true");
            router.replace("/(auth)/login");
          } catch (e) {
            console.error("Failed to save onboarding status or navigate:", e);
          }
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

  const handleFinish = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
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
      </Animated.View>
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
