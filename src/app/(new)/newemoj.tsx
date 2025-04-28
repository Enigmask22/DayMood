import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import MoodSelector from "@/components/newemoji/MoodSelector";
import ActivityButton from "@/components/newemoji/ActivityButton";
import SelectedEmoji from "@/components/newemoji/SelectedEmoji";
import ActionButtons from "@/components/newemoji/ActionButtons";
import Header from "@/components/newemoji/Header";
import { wp, hp } from "@/components/newemoji/utils";

export default function NewEmojiScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());

  const handleSelectMood = (id: number) => {
    setSelectedMood(id);
  };

  const handleSave = () => {
    // Xử lý lưu trạng thái mood
    // Thêm vào hệ thống lưu trữ tại đây
    router.back();
  };

  const handleBack = () => {
    router.back();
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
          <ActivityButton />
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
