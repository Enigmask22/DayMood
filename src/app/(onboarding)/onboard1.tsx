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
  Easing,
  PanResponder,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Giả sử chúng ta import từ file constant.ts
const ONBOARDINGTEXT3 = "#79BF5D";

const OnboardScreen1 = () => {
  const router = useRouter();
  const rotateValue = new Animated.Value(0);
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
          // Nếu vuốt sang trái đủ xa (hơn 50 đơn vị)
          router.push("/onboard2" as any);
        }
        // Reset vị trí về 0
        Animated.spring(pan.x, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["-20deg", "20deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={require("@/assets/images/onboard/onboard1.png")}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>
            Welcome to{"\n"}
            <Text style={styles.brandText}>DayMood</Text>
          </Text>
          <Text style={styles.subtitleText}>Let's make your day better</Text>
          {/* Biểu tượng vẫy tay */}
          <Animated.Text style={[styles.waveHand, { transform: [{ rotate }] }]}>
            👋
          </Animated.Text>
        </View>

        {/* Chỉ báo trang (pagination) */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationWrapper}>
            <View style={styles.paginationDot} />
            <View style={[styles.paginationDot, styles.inactiveDot]} />
            <View style={[styles.paginationDot, styles.inactiveDot]} />
          </View>
        </View>

        {/* Nút Getting Started */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/onboard2" as any)}
        >
          <Text style={styles.buttonText}>Getting Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 17,
    marginTop: 64, // Để tránh StatusBar
  },
  image: {
    width: width - 34, // Trừ đi padding 2 bên
    height: width - 34, // Để giữ tỷ lệ 1:1
    alignSelf: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 33,
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    color: "#000000",
    fontSize: 28,
    textAlign: "center",
    lineHeight: 36,
  },
  brandText: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: ONBOARDINGTEXT3,
  },
  subtitleText: {
    fontFamily: "Poppins-Light",
    fontSize: 20,
    color: "#666666",
    marginTop: 12,
    textAlign: "center",
  },
  waveHand: {
    fontSize: 30,
    marginTop: 16,
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
    backgroundColor: "#007AFF", // Màu xanh iOS
  },
  inactiveDot: {
    backgroundColor: "#D9D9D9", // Màu xám nhạt
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: "Inter-ExtraBold",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardScreen1;
