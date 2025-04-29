import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { wp, hp } from "../newemoji/utils";

interface ImageSectionProps {
  images: string[];
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onDeleteImage?: (index: number) => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  images = [],
  onTakePhoto,
  onPickFromGallery,
  onDeleteImage,
}) => {
  return (
    <View style={styles.mediaSection}>
      <View style={styles.mediaTitleContainer}>
        <MaterialIcons name="image" size={wp(5)} color="#333" />
        <Text style={styles.mediaTitle}>Image</Text>
      </View>

      {/* Image Display Area */}
      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.length === 1 ? (
            // Hiển thị một ảnh duy nhất ở giữa với nút xóa
            <View style={styles.imageWrapper}>
              <Image source={{ uri: images[0] }} style={styles.singleImage} />
              {onDeleteImage && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteImage(0)}
                >
                  <FontAwesome name="trash" size={wp(5)} color="#14532D" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Hiển thị nhiều ảnh dạng lưới với nút xóa cho mỗi ảnh
            <View style={styles.imageGrid}>
              {images.map((imageUri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.gridImage} />
                  {onDeleteImage && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => onDeleteImage(index)}
                    >
                      <FontAwesome name="trash" size={wp(4)} color="#14532D" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.mediaButtonsContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={onTakePhoto}>
          <FontAwesome name="camera" size={wp(5)} color="#333" />
          <Text style={styles.mediaButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={onPickFromGallery}
        >
          <FontAwesome name="image" size={wp(5)} color="#333" />
          <Text style={styles.mediaButtonText}>From Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mediaSection: {
    marginTop: hp(2.5),
  },
  mediaTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  mediaTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  imagesContainer: {
    alignItems: "center",
    marginBottom: hp(2),
  },
  imageWrapper: {
    position: "relative",
    margin: wp(1),
  },
  singleImage: {
    width: wp(80),
    height: wp(60),
    borderRadius: wp(3),
    resizeMode: "cover",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  gridImage: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(2),
    resizeMode: "cover",
  },
  deleteButton: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: wp(5),
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFD0", // Light yellow background
    borderRadius: wp(10),
    padding: wp(3),
    width: "48%",
  },
  mediaButtonText: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
});

export default ImageSection;
