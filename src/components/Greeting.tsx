import React from "react";
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
  return (
    <View style={styles.greetingContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.greetingText}>Hello there,</Text>
          <Text style={styles.nameText}>Hung Jonathan</Text>
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
    height: "100%",
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
    fontSize: width * 0.035,
    color: "#000",
  },
  nameText: {
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
    padding: width * 0.04,
    borderRadius: width * 0.04,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height * 0.003 },
    shadowOpacity: 0.1,
    shadowRadius: width * 0.013,
    elevation: 3,
  },
  quoteText: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default Greeting;
