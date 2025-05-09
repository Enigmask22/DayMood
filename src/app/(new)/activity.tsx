import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
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

  // Lưu dữ liệu
  const handleSave = () => {
    console.log("Saving data:", {
      date,
      mood: moodId,
      activities: selectedActivities,
      note,
      recordingsCount: recordings.length,
      imagesCount: images.length,
    });

    // Chuẩn bị dữ liệu âm thanh (recordings)
    type RecordingData = {
      id: number;
      uri: string;
      duration: string;
      isMusic?: boolean;
      isPaused?: boolean;
      name?: string;
    };

    let recordingsData: RecordingData[] = [];
    if (recordings.length > 0) {
      recordingsData = recordings.map((recording, index) => ({
        id: index,
        uri: recording.file,
        duration: recording.duration,
        isMusic: recording.isMusic || false,
        isPaused: recording.isPaused || false,
        name: recording.name || `Bản ghi #${index + 1}`,
      }));
      console.log("Recordings data được chuẩn bị:", recordingsData);
    }

    // Chuẩn bị dữ liệu hình ảnh
    type ImageData = {
      id: number;
      uri: string;
    };

    let imagesData: ImageData[] = [];
    if (images.length > 0) {
      imagesData = images.map((uri, index) => ({
        id: index,
        uri: uri,
      }));
      console.log("Số lượng ảnh:", images.length);
    }

    // Định dạng ngày giờ
    const formattedDate = date.toISOString();

    // Chuyển đổi dữ liệu sang JSON
    const recordingsJson =
      recordings.length > 0 ? JSON.stringify(recordingsData) : "";
    const imagesJson = images.length > 0 ? JSON.stringify(imagesData) : "";

    // Chuyển hướng đến trang card detail với tham số
    try {
      const params = {
        mood: moodId?.toString() || "4",
        activities: selectedActivities.join(","),
        note: note || "",
        date: formattedDate,
        recordings: recordingsJson,
        images: imagesJson,
      };

      router.push({
        pathname: "/(new)/carddetail" as any,
        params: params,
      });
    } catch (error) {
      console.error("Navigation error:", error);
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
      if (!result.canceled) {
        // Tạo URI dạng data:image/jpeg;base64 để dễ dàng hiển thị ở mọi nơi
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImages([...images, base64Uri]);
        console.log("Đã thêm ảnh base64");
      }
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
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
      if (!result.canceled) {
        // Tạo URI dạng data:image/jpeg;base64 để dễ dàng hiển thị ở mọi nơi
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImages([...images, base64Uri]);
        console.log("Đã thêm ảnh base64 từ thư viện");
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
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
  },
  content: {
    flex: 1,
    padding: wp(5),
  },
  headerContainer: {
    alignItems: "center",
  },
});
