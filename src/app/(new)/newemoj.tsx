import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import MoodSelector from "@/components/newemoji/MoodSelector";
import ActivityButton from "@/components/newemoji/ActivityButton";
import SelectedEmoji from "@/components/newemoji/SelectedEmoji";
import ActionButtons from "@/components/newemoji/ActionButtons";
import Header from "@/components/newemoji/Header";
import { wp, hp } from "@/components/newemoji/utils";

export default function NewEmojiScreen() {
  // Lấy tham số initialDate từ URL
  const params = useLocalSearchParams();
  const { initialDate } = params;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  // Sử dụng initialDate nếu có, nếu không thì sử dụng ngày hiện tại
  const [date, setDate] = useState<Date>(() => {
    if (initialDate && typeof initialDate === "string") {
      return new Date(initialDate);
    }
    return new Date();
  });

  // Cập nhật date khi initialDate thay đổi
  useEffect(() => {
    if (initialDate && typeof initialDate === "string") {
      setDate(new Date(initialDate));
    }
  }, [initialDate]);

  const handleSelectMood = (id: number) => {
    setSelectedMood(id);
  };

  const handleSave = () => {
    // Xử lý lưu trạng thái mood
    // Thêm vào hệ thống lưu trữ tại đây
    try {
      router.push("/(main)" as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleBack = () => {
    try {
      router.push("/(main)" as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Xử lý khi nhấn nút chọn hoạt động
  const handleSelectActivities = () => {
    // Điều hướng đến trang activity với params là mood và date
    try {
      router.push({
        pathname: "/(new)/activity" as any,
        params: {
          initialDate: date.toISOString(),
          selectedMood: selectedMood?.toString(),
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Header title="How are you?" />
          <DateTimeSelector date={date} setDate={setDate} />
          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
          />
          <ActivityButton onPress={handleSelectActivities} />
          <SelectedEmoji selectedMood={selectedMood} />
          <ActionButtons onBack={handleBack} onSave={handleSave} />
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
    alignItems: "center",
  },
});
