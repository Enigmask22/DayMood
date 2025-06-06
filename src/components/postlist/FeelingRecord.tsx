import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { HOME_COLOR, EMOJI_COLOR } from "src/utils/constant";
import { useState } from "react";
import Feeling from "./Feeling";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
export interface FeelingRecordProps {
  id?: string | number;
  index: number;
  total: number;
  date: string;
  emoji: string;
  feeling: string;
}

const FeelingRecord = ({
  id,
  index,
  total,
  date = "THURSDAY, MARCH 6 20:00",
  emoji = "sad",
  feeling = "I'm feeling bad",
}: FeelingRecordProps) => {
  const [showOptions, setShowOptions] = useState(false);
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

  const handleViewRecord = () => {
    setShowOptions(false);
    // Chuyển hướng đến trang xem chi tiết với record_id
    if (id) {
      router.push({
        pathname: "/(new)/viewrecord",
        params: { id: id.toString() },
      });
    } else {
      console.log("Không có ID record để xem chi tiết");
    }
  };

  const handleEditRecord = () => {
    setShowOptions(false);
    // Chuyển hướng đến trang chỉnh sửa với record_id
    if (id) {
      router.push({
        pathname: "/(new)/editrecord" as any,
        params: { id: id.toString() },
      });
    } else {
      console.log("Không có ID record để chỉnh sửa");
    }
  };

  return (
    <View style={styles.container}>
      {/* Emoji Section */}
      <Feeling
        emoji={emoji}
        showVerticalLine={!(index == total - 1)}
        isFirst={index === 0}
        isLast={index === total - 1}
      />

      <View style={styles.main}>
        <View style={styles.textContainer}>
          <Text style={styles.dateText}>{date}</Text>
          {/* Button - Áp dụng màu động */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={handleViewRecord}
          >
            <Text style={styles.buttonText} numberOfLines={1}>
              {feeling}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options Container */}
        <View style={styles.optionsContainer}>
          {/* Three dots button */}
          <TouchableOpacity
            onPress={() => setShowOptions(!showOptions)}
            style={styles.optionsButton}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={width * 0.06}
              color="black"
            />
          </TouchableOpacity>

          {/* Options Menu */}
          {showOptions && (
            <View style={styles.optionsMenu}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleViewRecord}
              >
                <Feather name="eye" size={width * 0.05} color="#333" />
                <Text style={styles.optionText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleEditRecord}
              >
                <Feather name="edit-2" size={width * 0.05} color="#333" />
                <Text style={styles.optionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Invisible Touchable Overlay to close menu when clicking outside */}
        {showOptions && (
          <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
            <View style={styles.touchableOverlay} />
          </TouchableWithoutFeedback>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: width * 0.025,
    padding: width * 0.04,
    paddingTop: height * 0.025,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: height * 0.005 },
    shadowOpacity: 0.4,
    shadowRadius: width * 0.013,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.02,
    marginRight: width * 0.03,
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.02,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.025,
  },
  textContainer: {
    flexDirection: "column",
    gap: height * 0.01,
    paddingHorizontal: width * 0.02,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Quicksand-Regular",
    fontSize: width * 0.032,
    color: HOME_COLOR.HOMETEXT,
    fontWeight: "500",
    width: width * 0.5,
    textAlign: "center",
  },
  button: {
    borderRadius: width * 0.045,
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.02,
    alignItems: "center",
    width: width * 0.38,
  },
  buttonText: {
    fontFamily: "Quicksand-Bold",
    color: "#fff",
    fontSize: width * 0.038,
    fontWeight: "600",
  },
  optionsContainer: {
    position: "absolute",
    top: height * 0.008,
    right: width * 0.02,
    zIndex: 10,
  },
  optionsButton: {
    padding: width * 0.008,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsMenu: {
    position: "absolute",
    top: height * 0.02,
    right: 0,
    backgroundColor: "white",
    borderRadius: width * 0.025,
    padding: width * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: width * 0.32,
    zIndex: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.02,
    gap: width * 0.015,
  },
  optionText: {
    fontFamily: "Quicksand-Medium",
    fontSize: width * 0.035,
    color: "#333",
  },
  touchableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 5,
  },
});

export default FeelingRecord;
