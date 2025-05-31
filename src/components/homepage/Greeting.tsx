import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Greeting = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Failed to load user data");
      }
    };
    
    loadUser();
  }, []);

  return (
    <View style={styles.greetingContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.greetingText}>Hello there,</Text>
          <Text style={styles.nameText}>{(user != null ? user.username : "")}</Text>
        </View>
        <Image
          source={require("@/assets/images/home/home_avatar.png")} // Replace with actual profile image URL'
          style={styles.profileImage}
        />
      </View>
      <Image
        source={require("@/assets/images/home/home_bg.png")} // Replace with actual profile image URL'
        style={styles.greetingImage}
      />
      {/* Quote Section */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>
          “You can't be that kid standing at the top of the waterslide,
          overthinking it.”
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "90%",
    zIndex: -1,
    // borderWidth: 1,
    // borderColor: "red",
    borderBottomLeftRadius: width * 0.08,
    borderBottomRightRadius: width * 0.08,
  },
  greetingContainer: {
    position: "relative",
    height: height * 0.35,
    overflow: "hidden",
    width: "100%",
  },
  greetingText: {
    fontFamily: "Quicksand-Semibold",
    fontSize: width * 0.035,
    color: "#000",
  },
  nameText: {
    fontFamily: "Quicksand-Bold",
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#000",
  },
  nameContainer: {
    flexDirection: "column",
    marginLeft: width * 0.025,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.025,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.05,
  },
  quoteContainer: {
    position: "absolute",
    bottom: height * 0.35 * 0.15,
    width: width * 0.9,
    alignSelf: "center",
    backgroundColor: "#fff",
    opacity: 0.97,
    padding: width * 0.04,
    borderRadius: width * 0.04,
    marginBottom: height * 0.02,
  },
  quoteText: {
    fontFamily: "Quicksand-Semibold",
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});

export default Greeting;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

