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

const { width, height } = Dimensions.get("window");

const TitleScreen = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/(onboarding)/onboard1");
  };

  return (
    <>
      <StatusBar backgroundColor={"white"} />
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require("@/assets/images/onboard/logo_icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Daymood</Text>
          </View>
          <Text style={styles.creator}>Created by DKDH_L01</Text>
        </SafeAreaView>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
    borderRadius: (width * 0.5) / 2,
    overflow: "hidden",
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#79BF5D",
  },
  creator: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    textAlign: "center",
    fontSize: 20,
    color: "#000000",
  },
});

export default TitleScreen;
