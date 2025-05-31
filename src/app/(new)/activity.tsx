import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Dimensions, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Header from "@/components/newemoji/Header";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import { wp, hp } from "@/components/newemoji/utils";
import { Audio } from "expo-av";

// Các component mới
import BackHeaderWithEmoji from "@/components/activity/BackHeaderWithEmoji";
import ActivitiesSelector from "@/components/activity/ActivitiesSelector";
import NoteSection from "@/components/activity/NoteSection";
import ImageSection from "@/components/activity/ImageSection";
import AudioSection from "@/components/activity/AudioSection";
import SaveButton from "@/components/activity/SaveButton";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get("window");
export default function ActivityScreen() {
  // Lấy tham số từ URL
  const params = useLocalSearchParams();
  const { initialDate, selectedMood } = params;
  const [recordings, setRecordings] = useState<
    {
      sound?: Audio.Sound;
      duration: string;
      file: string;
      isPlaying?: boolean;
      isPaused?: boolean;
      isMusic?: boolean;
      name?: string;
      currentPosition?: string;
      durationMillis?: number;
      currentMillis?: number;
    }[]
  >([]);
  const [date, setDate] = useState<Date>(() => {
    if (initialDate && typeof initialDate === "string") {
      return new Date(initialDate);
    }
    return new Date();
  });

  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [isFullNoteOpen, setIsFullNoteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Lấy emoji tương ứng với mood
  const moodId = selectedMood ? parseInt(selectedMood as string) : null;

  // Cập nhật date khi initialDate thay đổi
  useEffect(() => {
    if (initialDate && typeof initialDate === "string") {
      setDate(new Date(initialDate));
    }
  }, [initialDate]);

  // Xử lý khi chọn activity
  const handleActivitySelect = (activityId: number) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  // Quay lại trang trước
  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Xử lý mở/đóng trình soạn thảo ghi chú đầy đủ
  const handleToggleFullNote = () => {
    setIsFullNoteOpen(!isFullNoteOpen);
  };

  // Xử lý thay đổi ghi chú
  const handleChangeNote = (text: string) => {
    setNote(text);
  };

const handleSave = async () => {
  try {
    console.log("Saving data:", {
      date,
      mood: moodId,
      activities: selectedActivities,
      note,
      recordingsCount: recordings.length,
      imagesCount: images.length,
    });

    setIsLoading(true);

    // Prepare recording data (unchanged)
    let recordingsData: { id: number; uri: string; duration: string; isMusic: boolean; isPaused: boolean; name: string; }[] = [];
    if (recordings.length > 0) {
      recordingsData = recordings.map((recording, index) => ({
        id: index,
        uri: recording.file,
        duration: recording.duration,
        isMusic: recording.isMusic || false,
        isPaused: recording.isPaused || false,
        name: recording.name || `Bản ghi #${index + 1}`,
      }));
    }
    
    // Store images directly in FileSystem and pass file paths
    const imageRefs = [];
    
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        try {
          // Generate unique filename for this image
          const imageId = `temp_image_${Date.now()}_${i}`;
          const filePath = `${FileSystem.cacheDirectory}${imageId}.jpg`;
          
          // Get base64 data (remove data URL prefix if present)
          let base64Data = images[i];
          if (base64Data.startsWith('data:')) {
            base64Data = base64Data.split(',')[1];
          }
          
          // Write the file directly to FileSystem
          await FileSystem.writeAsStringAsync(filePath, base64Data, { 
            encoding: FileSystem.EncodingType.Base64 
          });
          
          // Store file path directly in imageRefs - NO AsyncStorage
          imageRefs.push(filePath);
          
          console.log(`Saved image ${i+1}/${images.length} to ${filePath}`);
        } catch (err) {
          console.error(`Failed to save image ${i+1}:`, err);
        }
      }
    }
    
    // Format date
    const formattedDate = date.toISOString();

    // Convert to JSON
    const recordingsJson = recordings.length > 0 ? JSON.stringify(recordingsData) : "";
    const imagesJson = JSON.stringify(imageRefs); // Just passing file paths now

    // Navigate to card detail
    router.push({
      pathname: "/(new)/carddetail" as any,
      params: {
        mood: moodId?.toString() || "4",
        activities: selectedActivities.join(","),
        note: note || "",
        date: formattedDate,
        recordings: recordingsJson,
        images: imagesJson,
        useImageRefs: "true", // Flag to indicate we're using file paths
      },
    });
  } catch (error) {
    console.error("Error saving activity data:", error);
    setIsLoading(false);
    Alert.alert("Error", "Failed to save data. Please try again.");
  }
};

  // Thay vì chỉ lưu một ảnh, chúng ta sẽ lưu mảng các ảnh
  const [images, setImages] = useState<string[]>([]);

  // Cập nhật hàm handleTakePhoto để thêm ảnh mới vào mảng
  const handleTakePhoto = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true, // Yêu cầu trả về dữ liệu base64
      });

      console.log("Camera result:", JSON.stringify(result, null, 2)); // Log the full result

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0 && result.assets[0].base64) {
          const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
          console.log("Generated base64 URI (take photo):", base64Uri.substring(0, 100) + "..."); // Log a snippet
          setImages((prevImages) => [...prevImages, base64Uri]);
          console.log("Đã thêm ảnh base64");
        } else {
          console.warn("Camera result missing assets or base64 data.");
        }
      } else {
        console.log("Camera launch canceled by user.");
      }
    } catch (error) {
      console.error("Error requesting camera permissions or launching camera:", error);
    }
  };

  // Cập nhật hàm handlePickFromGallery để chọn ảnh từ thư viện
  const handlePickFromGallery = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true, // Yêu cầu trả về dữ liệu base64
      });

      console.log("Gallery result:", JSON.stringify(result, null, 2)); // Log the full result

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0 && result.assets[0].base64) {
          const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
          console.log("Generated base64 URI (pick gallery):", base64Uri.substring(0, 100) + "..."); // Log a snippet
          setImages((prevImages) => [...prevImages, base64Uri]);
          console.log("Đã thêm ảnh base64 từ thư viện");
        } else {
          console.warn("Gallery result missing assets or base64 data.");
        }
      } else {
        console.log("Gallery pick canceled by user.");
      }
    } catch (error) {
      console.error("Error requesting media library permissions or launching image library:", error);
    }
  };

  // Thêm hàm xử lý xóa ảnh
  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Back button với emoji */}
          <BackHeaderWithEmoji moodId={moodId} onBack={handleBack} />

          {/* Tiêu đề - bọc trong container căn giữa */}
          <View style={styles.headerContainer}>
            <Header title="What did you do?" />
          </View>

          {/* Date Time Selector */}
          <DateTimeSelector date={date} setDate={setDate} />

          {/* Activities */}
          <ActivitiesSelector
            selectedActivities={selectedActivities}
            onActivitySelect={handleActivitySelect}
          />

          {/* Note Section */}
          <NoteSection
            note={note}
            onChangeNote={handleChangeNote}
            isFullNoteOpen={isFullNoteOpen}
            onToggleFullNote={handleToggleFullNote}
          />

          {/* Image Section */}
          <ImageSection
            images={images}
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
            onDeleteImage={handleDeleteImage}
          />

          {/* Audio Section */}
          <AudioSection recordings={recordings} setRecordings={setRecordings} />

          {/* Save Button */}
          <SaveButton onSave={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7ED",
    paddingTop: height * 0.035, // Thêm khoảng cách trên cùng
  },
  content: {
    flex: 1,
    padding: wp(5),
  },
  headerContainer: {
    alignItems: "center",
  },
});
