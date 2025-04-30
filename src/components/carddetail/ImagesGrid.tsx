import React, { useState } from "react";
import { View, StyleSheet, Image, Text, ActivityIndicator } from "react-native";
import { wp, hp } from "@/components/newemoji/utils";

interface ImagesGridProps {
  images?: string[]; // Đường dẫn đến hình ảnh
}

const ImagesGrid: React.FC<ImagesGridProps> = ({ images }) => {
  // State để quản lý quá trình tải hình ảnh
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [errorStates, setErrorStates] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Kiểm tra xem có ảnh không
  const hasImages = images && images.length > 0;

  // console.log("ImagesGrid rendered - hasImages:", hasImages);
  // console.log("ImagesGrid - images:", images);

  if (!hasImages) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hình ảnh</Text>
        <View style={styles.noImagesContainer}>
          <Text style={styles.noImagesText}>Không có hình ảnh nào</Text>
        </View>
      </View>
    );
  }

  // Xử lý khi ảnh tải xong
  const handleImageLoad = (index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
    console.log(`Ảnh ${index + 1} đã tải xong`);
  };

  // Xử lý khi ảnh tải lỗi
  const handleImageError = (index: number) => {
    setErrorStates((prev) => ({ ...prev, [index]: true }));
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
    console.log(`Lỗi khi tải ảnh ${index + 1}`);
  };

  // Xác định loại URI để ghi log
  const getUriType = (uri: string) => {
    if (uri.startsWith("data:image")) return "Base64";
    if (uri.startsWith("file://")) return "Local File";
    if (uri.startsWith("http")) return "Web URL";
    return "Unknown format";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hình ảnh</Text>
      <View style={styles.imagesGrid}>
        {images.map((imageUri, index) => {
          console.log(
            `Đang render ảnh ${index + 1} (${getUriType(imageUri)}):`,
            imageUri.substring(0, 50) + (imageUri.length > 50 ? "..." : "")
          );

          return (
            <View key={index} style={styles.imageContainer}>
              {loadingStates[index] !== false && (
                <ActivityIndicator
                  style={styles.loader}
                  size="large"
                  color="#14532D"
                />
              )}

              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.image,
                  errorStates[index] ? styles.errorImage : null,
                ]}
                resizeMode="cover"
                onLoadStart={() =>
                  setLoadingStates((prev) => ({ ...prev, [index]: true }))
                }
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />

              {errorStates[index] && (
                <View style={styles.errorOverlay}>
                  <Text style={styles.errorText}>Không thể tải ảnh</Text>
                  <Text style={styles.errorSubText}>
                    {getUriType(imageUri)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(3),
    marginTop: hp(1),
  },
  title: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginBottom: hp(1.5),
    color: "#333",
    fontFamily: "Quicksand-Bold",
  },
  noImagesContainer: {
    height: wp(30),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: wp(3),
  },
  noImagesText: {
    color: "#888",
    fontSize: wp(4),
    fontFamily: "Quicksand-Medium",
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageContainer: {
    position: "relative",
    width: wp(42),
    height: wp(30),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  errorImage: {
    opacity: 0.5,
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  errorText: {
    color: "#FFF",
    fontSize: wp(3),
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubText: {
    color: "#FFF",
    fontSize: wp(2.5),
    textAlign: "center",
    marginTop: hp(0.5),
  },
});

export default ImagesGrid;
