import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { wp, hp } from "@/components/newemoji/utils";

// Map emoji IDs to emoji images
const emojiMap: { [key: number]: any } = {
  1: require("@/assets/emoji/sad.gif"),
  2: require("@/assets/emoji/angry.gif"),
  3: require("@/assets/emoji/normal.gif"),
  4: require("@/assets/emoji/joyful.gif"),
  5: require("@/assets/emoji/excellent.gif"),
};

interface EmojiDisplayProps {
  moodId: number;
}

const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ moodId }) => {
  // Lấy emoji tương ứng với mood
  const emojiSource = emojiMap[moodId] || emojiMap[4]; // Default to joyful

  return (
    <View style={styles.emojiContainer}>
      <Image
        source={emojiSource}
        style={styles.emojiImage}
        contentFit="contain"
        autoplay={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(2),
  },
  emojiImage: {
    width: wp(20),
    height: wp(20),
  },
});

export default EmojiDisplay;
