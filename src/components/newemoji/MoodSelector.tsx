import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { wp, hp } from "./utils";

export const moods = [
  {
    id: 1,
    name: "Sad",
    emoji: require("@/assets/emoji/sad.gif"),
    color: "#7E7E7E",
  },
  {
    id: 2,
    name: "Angry",
    emoji: require("@/assets/emoji/angry.gif"),
    color: "#EF0808",
  },
  {
    id: 3,
    name: "Normal",
    emoji: require("@/assets/emoji/normal.gif"),
    color: "#540BFF",
  },
  {
    id: 4,
    name: "Joyful",
    emoji: require("@/assets/emoji/joyful.gif"),
    color: "#FCA10C",
  },
  {
    id: 5,
    name: "Excellent",
    emoji: require("@/assets/emoji/excellent.gif"),
    color: "#22C55E",
  },
];

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelectMood: (id: number) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.moodsTitleContainer}>
        <Text style={styles.moodsTitle}>MOODS</Text>
        <View style={styles.moodsTitleLine} />
      </View>

      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodItem,
              selectedMood === mood.id && { backgroundColor: mood.color },
            ]}
            onPress={() => onSelectMood(mood.id)}
          >
            <Image
              source={mood.emoji}
              style={styles.moodEmoji}
              contentFit="contain"
              autoplay={true}
            />
            <Text
              style={[
                styles.moodText,
                selectedMood === mood.id && { color: "white" },
              ]}
            >
              {mood.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.promptContainer}>
        <View style={styles.promptArrow} />
        <Text style={styles.promptText}>Select your mood ...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  moodsTitleContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp(2),
  },
  moodsTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#333",
  },
  moodsTitleLine: {
    width: wp(15),
    height: hp(0.3),
    backgroundColor: "#333",
    marginTop: hp(0.5),
  },
  moodContainer: {
    flexDirection: "row",
    backgroundColor: "#11A050",
    borderRadius: wp(5),
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    justifyContent: "space-between",
    width: wp(90),
    marginBottom: hp(0.8),
  },
  moodItem: {
    alignItems: "center",
    padding: wp(1),
    borderRadius: wp(2),
  },
  moodEmoji: {
    width: wp(10),
    height: wp(10),
  },
  moodText: {
    fontSize: wp(3),
    marginTop: hp(0.5),
    color: "white",
    fontWeight: "500",
  },
  promptContainer: {
    backgroundColor: "white",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
    marginVertical: hp(1),
    position: "relative",
    marginTop: hp(1),
  },
  promptArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: wp(2.5),
    borderRightWidth: wp(2.5),
    borderBottomWidth: wp(2.5),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    position: "absolute",
    top: -wp(2.5),
    alignSelf: "center",
  },
  promptText: {
    fontSize: wp(4),
    color: "#888",
  },
});

export default MoodSelector;
