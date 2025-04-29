import React from "react";
import { View, StyleSheet } from "react-native";
import { wp, hp } from "@/components/newemoji/utils";

interface ImagesGridProps {
  images?: string[]; // Đường dẫn đến hình ảnh
}

const ImagesGrid: React.FC<ImagesGridProps> = ({ images }) => {
  // Kể cả không có ảnh nào, vẫn hiển thị placeholder
  const hasImages = images && images.length > 0;
  const placeholders = hasImages ? images : [1, 2, 3, 4];

  return (
    <View style={styles.imagesGrid}>
      {placeholders.map((item, index) => (
        <View key={index} style={styles.placeholderImage} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: hp(3),
  },
  placeholderImage: {
    width: wp(42),
    height: wp(30),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    backgroundColor: "#87CEEB", // Màu xanh da trời nhạt làm placeholder
  },
});

export default ImagesGrid;
