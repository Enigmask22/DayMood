import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // Hoặc thư viện icon bạn đang dùng

const { width, height } = Dimensions.get("window"); // Lấy cả width và height

// Giả sử bạn có đường dẫn đúng đến ảnh
const homeChangeImage = require("@/assets/images/home/home_change.png");
// 2. Định nghĩa nguồn ảnh nền
const homeBgImage = require("@/assets/images/home/home_bg2.png");

// Hàm tiện ích để tính toán kích thước dựa trên chiều rộng màn hình
const wp = (percentage: number) => {
  const value = (percentage * width) / 100;
  return Math.round(value);
};

// Hàm tiện ích để tính toán kích thước dựa trên chiều cao màn hình (ít dùng hơn cho UI, nhưng hữu ích cho font)
const hp = (percentage: number) => {
  const value = (percentage * height) / 100;
  return Math.round(value);
};

// Kích thước font cơ sở, có thể điều chỉnh
const baseFontSize = wp(4); // Ví dụ: 4% chiều rộng màn hình

const MoodPromptCard = () => {
  // Định nghĩa màu sắc cho gradient border
  const rainbowColors = [
    "#FF00FF", // Magenta
    "#0000FF", // Blue
    "#00FFFF", // Cyan
    "#00FF00", // Green
    "#FFFF00", // Yellow
    "#FFA500", // Orange
    "#FF0000", // Red
    "#FF00FF", // Loop back to Magenta for smoothness
  ];

  return (
    <LinearGradient
      colors={rainbowColors}
      start={{ x: 0.0, y: 0.5 }} // Bắt đầu từ trái sang
      end={{ x: 1.0, y: 0.5 }} // Kết thúc ở phải
      style={styles.gradientBorder}
    >
      {/* 3. Thay thế View bằng ImageBackground */}
      <ImageBackground
        source={homeBgImage} // 4. Truyền source ảnh
        style={styles.cardContainer} // Giữ nguyên style chính
        imageStyle={styles.imageBackgroundStyle} // Style cho chính ảnh nền để bo góc
        resizeMode="cover" // hoặc 'stretch', 'contain' tùy theo yêu cầu
      >
        {/* Phần nội dung bên trái */}
        <View style={styles.leftContent}>
          <Text style={styles.titleText}>How are you feeling today?</Text>
          <View style={styles.recordMoodContainer}>
            <Text style={styles.subtitleText}>Tap to record mood</Text>
            <TouchableOpacity style={styles.recordButton}>
              <Ionicons
                name="chevron-forward-outline"
                size={wp(4)}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Phần hình ảnh bên phải */}
        <View style={styles.rightContent}>
          <Image
            source={homeChangeImage}
            style={styles.moodImage}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: wp(5), // ~20px trên màn hình ~400px
    padding: wp(0.75), // ~3px
    marginHorizontal: wp(3.75), // ~15px
    marginTop: hp(1.5), // Giảm từ hp(2.5) xuống hp(1.5) (hoặc giá trị khác nhỏ hơn)
  },
  cardContainer: {
    // 5. Xóa backgroundColor
    // backgroundColor: "#F8FFF8",
    borderRadius: wp(4.25), // Giữ lại để clip nội dung con nếu cần, nhưng ImageBackground sẽ xử lý ảnh
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(3.75), // ~15px
    paddingVertical: hp(2.5), // ~20px
    height: hp(12),
    width: wp(80),
    overflow: "hidden", // 6. Đảm bảo overflow hidden để bo góc ảnh nền
  },
  // 6. Style riêng cho ảnh nền để bo góc
  imageBackgroundStyle: {
    borderRadius: wp(4.25),
  },
  leftContent: {
    flex: 1,
    marginRight: wp(2.5), // ~10px
    backgroundColor: "transparent", // Đảm bảo nền của nội dung con trong suốt
  },
  rightContent: {
    backgroundColor: "transparent", // Đảm bảo nền của nội dung con trong suốt
  },
  titleText: {
    fontFamily: "Quicksand-Bold",
    fontSize: baseFontSize * 1.125, // ~18px (1.125 * 16)
    fontWeight: "bold",
    color: "#000", // Có thể cần đổi màu chữ nếu nền mới làm khó đọc
    marginBottom: hp(1), // ~8px
  },
  recordMoodContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  subtitleText: {
    fontFamily: "Quicksand-Regular",
    fontSize: baseFontSize * 0.875, // ~14px (0.875 * 16)
    color: "#888", // Có thể cần đổi màu chữ nếu nền mới làm khó đọc
    marginRight: wp(2), // ~8px
  },
  recordButton: {
    backgroundColor: "#34C759",
    width: wp(8),
    height: wp(6),
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  moodImage: {
    width: wp(25), // Giữ nguyên tỉ lệ %
    height: wp(20), // Giữ nguyên tỉ lệ %
  },
});

export default MoodPromptCard;
