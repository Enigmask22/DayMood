import RecordsList from "@/components/RecordList";
import Greeting from "@/components/Greeting";
import { HOME_COLOR } from "@/utils/constant";
import React from "react";
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions } from "react-native";
const {width, height} = Dimensions.get("window");
const HomePage = () => {
  const records = [
    {
      date: "THURSDAY, MARCH 6 20:00",
      emoji: "sad",
      feeling: "I'm feeling bad",
    },
    {
      date: "FRIDAY, MARCH 7 18:00",
      emoji: "excellent",
      feeling: "I'm feeling great",
    },
    {
      date: "SATURDAY, MARCH 8 14:00",
      emoji: "joyful",
      feeling: "I'm feeling joyful",
    },
    {
      date: "SUNDAY, MARCH 9 12:00",
      emoji: "normal",
      feeling: "I'm feeling normal",
    },
    {
      date: "MONDAY, MARCH 10 10:00",
      emoji: "angry",
      feeling: "I'm feeling angry",
    },
    // Add more records as needed
  ];
  return (
    <View style={styles.container}>
      {/* <Text style={[styles.text, { paddingVertical: 180 }]}>
        Welcome to the Homepage!
      </Text> */}
      {/* <View style={{width: "100%" , height: 300, position: "relative"}}>
        <View style={{width: "100%" , height: 300, position: "absolute", marginBottom: 20}}>
          <Image 
          source={require("@/assets/images/home/home_header.png")}
          resizeMode="contain"
          style={{
            height: "100%",
            padding: 20,
            justifyContent: 'center',
            width: '100%',
            resizeMode: 'cover'
          }}
          />
        </View> */}
        {/* <Text style={styles.greeting}> Hello there, Hung Jonathan </Text>
      </View> */}
      <ImageBackground 
        source={require("@/assets/images/home/home_header.png")}
        style={styles.background}
      >
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <View>
            <Text style={styles.greeting}> Hello there</Text>
            <Text style={styles.quote}> Hung Jonathan </Text>
          </View>
          <View>
            {/* <Image></Image> */}
          </View>
        </View>
      </ImageBackground>
      <RecordsList records={records} />
      {/* Header */}
      {/* MoodInput */}
      {/* RecentRecords */}
      {/* BottomNavigation */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  introContainer: {
    flex: 0.51,
    // justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "red",
  },
  background: {
    height: height * 0.4,
    width: width,
    padding: height * 0.05,
    marginBottom: height * 0.03,
  },
  greeting: {
    fontSize: 16,
    color: "#000",
  },
  quote: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#000',
  }
});

export default HomePage;
