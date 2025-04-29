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

  // Lưu dữ liệu
  const handleSave = () => {
    // Logic lưu dữ liệu
    console.log("Saving data:", {
      date,
      mood: moodId,
      activities: selectedActivities,
      note,
      recordings,
    });

    // Chuẩn bị dữ liệu recordings để truyền qua params
    type RecordingData = {
      id: number;
      uri: string;
      duration: string;
    };

    let recordingsData: RecordingData[] = [];
    if (recordings.length > 0) {
      recordingsData = recordings.map((recording, index) => ({
        id: index,
        uri: recording.file,
        duration: recording.duration,
      }));
    }

    // Định dạng và chuẩn bị dữ liệu
    const formattedDate = date.toISOString();

    // Chuyển hướng đến trang card detail với tham số
    try {
      router.push({
        pathname: "/(new)/carddetail" as any,
        params: {
          mood: moodId?.toString() || "4",
          activities: selectedActivities.join(","),
          note: note || "",
          date: formattedDate,
          recordings: JSON.stringify(recordingsData),
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Xử lý chức năng ảnh
  const handleTakePhoto = () => {
    // Xử lý chụp ảnh tại đây
    console.log("Take photo");
  };

  const handlePickFromGallery = () => {
    // Xử lý chọn ảnh từ thư viện
    console.log("Pick from gallery");
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
            onChangeNote={setNote}
            isFullNoteOpen={isFullNoteOpen}
            onToggleFullNote={() => setIsFullNoteOpen(!isFullNoteOpen)}
          />

          {/* Image Section */}
          <ImageSection
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
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
