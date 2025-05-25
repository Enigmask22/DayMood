import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import MoodSelector from "@/components/newemoji/MoodSelector";
import ActivityButton from "@/components/newemoji/ActivityButton";
import SelectedEmoji from "@/components/newemoji/SelectedEmoji";
import ActionButtons from "@/components/newemoji/ActionButtons";
import Header from "@/components/newemoji/Header";
import { wp, hp } from "@/components/newemoji/utils";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";

// Map mood IDs to titles
const moodTitles: { [key: number]: string } = {
  1: "Not feeling good today",
  2: "I'm feeling angry",
  3: "Just an ordinary day",
  4: "It's a good day",
  5: "Today is so good",
};

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cập nhật date khi initialDate thay đổi
  useEffect(() => {
    if (initialDate && typeof initialDate === "string") {
      setDate(new Date(initialDate));
    }
  }, [initialDate]);

  const handleSelectMood = (id: number) => {
    setSelectedMood(id);
  };

  const handleSave = async () => {
    // Kiểm tra xem mood đã được chọn hay chưa
    if (!selectedMood) {
      Alert.alert("Thông báo", "Vui lòng chọn tâm trạng trước khi lưu");
      return;
    }

    try {
      setIsLoading(true);

      // Lấy title từ moodTitles dựa vào selectedMood
      const moodTitle = moodTitles[selectedMood] || "How I feel today";

      // Chuẩn bị dữ liệu gửi đi với title từ mood
      const recordData = {
        date: date.toISOString(),
        mood_id: selectedMood,
        user_id: DEFAULT_USER_ID,
        status: "ACTIVE",
        title: moodTitle, // Thêm title dựa vào mood
      };

      console.log("Gửi dữ liệu:", recordData);

      // Gọi API để lưu record
      const response = await fetch(API_ENDPOINTS.RECORDS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi khi lưu dữ liệu: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Kết quả từ API:", result);

      // Hiển thị thông báo thành công
      Alert.alert("Thành công", "Đã lưu cảm xúc thành công!", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(main)" as any);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      Alert.alert("Lỗi", `Không thể lưu dữ liệu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to main screen if back navigation fails
      router.push("/(main)" as any);
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
          <ActionButtons
            onBack={handleBack}
            onSave={handleSave}
            isLoading={isLoading}
          />
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
