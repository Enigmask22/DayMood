import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const TitleScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation sequence khi component mount
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation cho "tap to continue"
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    const timer = setTimeout(startPulse, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    router.push("/(onboarding)/onboard1");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={["#f0f9f0", "#e8f5e8", "#d1e7dd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.container}>
          {/* Background Decorative Elements */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          {/* Main Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoShadow}>
                <Image
                  source={require("@/assets/images/onboard/logo_icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>DayMood</Text>
              <Text style={styles.subtitle}>Track your daily emotions</Text>
            </View>
          </Animated.View>

          {/* Bottom Section */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.creator}>Created by DKDH_L01</Text>
            <Animated.View
              style={[
                styles.tapToContinueContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.tapIndicator}>
                <View style={styles.tapDot} />
              </View>
              <Text style={styles.tapToContinue}>Tap to continue</Text>
            </Animated.View>
          </Animated.View>

          {/* Floating Particles */}
          <View style={styles.particlesContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
            <View style={[styles.particle, styles.particle4]} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundDecoration: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: "white",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#2d3436",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#636e72",
    textAlign: "center",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 60,
  },
  creator: {
    fontSize: 14,
    fontWeight: "500",
    color: "#74b9ff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  tapToContinueContainer: {
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: "rgba(45, 52, 54, 0.9)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(116, 185, 255, 0.2)",
    minWidth: 160,
  },
  tapIndicator: {
    marginBottom: 6,
  },
  tapDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  tapToContinue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  particle1: {
    top: "20%",
    left: "15%",
  },
  particle2: {
    top: "60%",
    right: "20%",
  },
  particle3: {
    bottom: "30%",
    left: "25%",
  },
  particle4: {
    top: "40%",
    left: "70%",
  },
});

export default TitleScreen;
