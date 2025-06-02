import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wp } from "../newemoji/utils";

// Map emoji IDs to emoji images
const emojiMap: { [key: number]: any } = {
  1: require("@/assets/emoji/sad.gif"),
  2: require("@/assets/emoji/angry.gif"),
  3: require("@/assets/emoji/normal.gif"),
  4: require("@/assets/emoji/joyful.gif"),
  5: require("@/assets/emoji/excellent.gif"),
  // Add more emojis as needed
};

interface BackHeaderWithEmojiProps {
  moodId: number | null;
  onBack: () => void;
}

const BackHeaderWithEmoji: React.FC<BackHeaderWithEmojiProps> = ({
  moodId,
  onBack,
}) => {
  const [backPressed, setBackPressed] = React.useState(false);

  // Lấy emoji tương ứng với mood
  const emojiSource =
    moodId && emojiMap[moodId] ? emojiMap[moodId] : emojiMap[4]; // Default to normal

  return (
    <View style={styles.backHeader}>
      <LinearGradient
        colors={["#22c55e", "#2ca148"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.buttonGradient, backPressed && styles.buttonPressed]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={wp(6)} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      <Image source={emojiSource} style={styles.emojiImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: wp(1),
  },
  buttonGradient: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.2)",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderColor: "rgba(50, 183, 104, 0.4)",
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  emojiImage: {
    width: wp(8),
    height: wp(8),
    marginLeft: wp(2),
  },
});

export default BackHeaderWithEmoji;
