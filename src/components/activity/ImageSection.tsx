import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { wp, hp } from "../newemoji/utils";

interface ImageSectionProps {
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  onTakePhoto,
  onPickFromGallery,
}) => {
  return (
    <View style={styles.mediaSection}>
      <View style={styles.mediaTitleContainer}>
        <MaterialIcons name="image" size={wp(5)} color="#333" />
        <Text style={styles.mediaTitle}>Image</Text>
      </View>
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
