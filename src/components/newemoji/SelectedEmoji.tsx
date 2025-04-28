import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { moods } from "./MoodSelector";
import { wp, hp } from "./utils";

interface SelectedEmojiProps {
  selectedMood: number | null;
}

const SelectedEmoji: React.FC<SelectedEmojiProps> = ({ selectedMood }) => {
  if (!selectedMood) return null;

  const selectedMoodObj = moods.find((m) => m.id === selectedMood);
  if (!selectedMoodObj) return null;

  return (
    <View style={styles.selectedEmojiContainer}>
      <Image
        source={selectedMoodObj.emoji}
        style={styles.selectedEmoji}
        contentFit="contain"
        autoplay={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  selectedEmojiContainer: {
    marginVertical: hp(2),
    height: wp(30),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedEmoji: {
    width: wp(25),
    height: wp(25),
  },
});

export default SelectedEmoji;
