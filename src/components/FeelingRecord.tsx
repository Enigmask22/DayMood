import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { HOME_COLOR, EMOJI_COLOR } from "@/utils/constant";
const { width, height } = Dimensions.get("window");
export interface FeelingRecordProps {
  date: string;
  emoji: string;
  feeling: string;
}

// Mapping of emoji names to their image paths
const emojiMap: { [key: string]: any } = {
  sad: require("@/assets/emoji/sad.png"),
  excellent: require("@/assets/emoji/excellent.png"),
  joyful: require("@/assets/emoji/joyful.png"),
  normal: require("@/assets/emoji/normal.png"),
  angry: require("@/assets/emoji/angry.png"),
  // Add more emojis as needed
};

const FeelingRecord = ({
  date = "THURSDAY, MARCH 6 20:00",
  emoji = "sad",
  feeling = "I'm feeling bad",
}: FeelingRecordProps) => {
  // Use the emojiMap to get the correct image source
  const emojiSource = emojiMap[emoji] || emojiMap["normal"]; // Fallback to a default emoji if not found

  // Logic lấy màu nút dựa trên emoji
  const getButtonColor = () => {
    switch (emoji) {
      case "normal":
        return EMOJI_COLOR.NORMAL;
      case "angry":
        return EMOJI_COLOR.ANGRY;
      case "sad":
        return EMOJI_COLOR.SAD;
      case "excellent":
        return EMOJI_COLOR.EXCELLENT;
      case "joyful":
        return EMOJI_COLOR.JOYFUL;
      default:
        return "#2E7D32"; // Màu mặc định nếu không khớp
    }
  };

  const buttonColor = getButtonColor();

  return (
    <View style={styles.container}>
      {/* Emoji Section */}
      <Image
        source={emojiSource}
        resizeMode="contain"
        style={styles.imageContainer}
      />
      <View style={styles.textContainer}>
        <Text style={styles.dateText}>{date}</Text>
        {/* Button - Áp dụng màu động */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
        >
          <Text style={styles.buttonText}>{feeling}</Text>
        </TouchableOpacity>
      </View>
      <MaterialCommunityIcons
        name="dots-horizontal"
        size={width * 0.06}
        color="black"
        style={styles.options}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: width * 0.025,
    padding: width * 0.06,
    paddingTop: height * 0.035,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: height * 0.005 },
    shadowOpacity: 0.4,
    shadowRadius: width * 0.013,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.025,
    width: width * 0.8,
  },
  textContainer: {
    flexDirection: "column",
    gap: height * 0.015,
    paddingHorizontal: width * 0.025,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: width * 0.035,
    color: HOME_COLOR.HOMETEXT,
    fontWeight: "500",
    width: width * 0.5,
    textAlign: "center",
  },

  imageContainer: {
    width: width * 0.18,
    height: width * 0.18,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: width * 0.05,
    paddingVertical: height * 0.012,
    alignItems: "center",
    width: width * 0.4,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
  options: {
    position: "absolute",
    top: height * 0.012,
    right: width * 0.025,
  },
});

export default FeelingRecord;
