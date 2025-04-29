import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { wp, hp } from "@/components/newemoji/utils";
import { format } from "date-fns";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

// Import các component đã tách
import DateTimeHeader from "@/components/carddetail/DateTimeHeader";
import EmojiDisplay from "@/components/carddetail/EmojiDisplay";
import NoteCard from "@/components/carddetail/NoteCard";
import ImagesGrid from "@/components/carddetail/ImagesGrid";
import RecordingsList from "@/components/carddetail/RecordingsList";
import MusicPlayer from "@/components/carddetail/MusicPlayer";

// Map emoji IDs to emoji images
const emojiMap: { [key: number]: any } = {
  1: require("@/assets/emoji/sad.gif"),
  2: require("@/assets/emoji/angry.gif"),
  3: require("@/assets/emoji/normal.gif"),
  4: require("@/assets/emoji/joyful.gif"),
  5: require("@/assets/emoji/excellent.gif"),
};

// Map mood IDs to titles
const moodTitles: { [key: number]: string } = {
  1: "Not feeling good today",
  2: "I'm feeling angry",
  3: "Just an ordinary day",
  4: "It's a good day",
  5: "Today is so good",
};

// Định nghĩa kiểu dữ liệu cho bản ghi âm
interface RecordingData {
  id: number;
  uri: string;
  duration: string;
  sound?: Audio.Sound;
  isPlaying?: boolean;
  fileExists: boolean;
}

export default function CardDetailScreen() {
  // Nhận các tham số từ navigation
  const params = useLocalSearchParams();
  const moodId = params.mood ? parseInt(params.mood as string) : 4; // Default to joyful
  const note = (params.note as string) || "";
  const dateParam = params.date as string;

  // Xử lý dữ liệu bản ghi âm
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  // Tải dữ liệu bản ghi âm từ params
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        if (params.recordings) {
          const recordingsJson = JSON.parse(params.recordings as string);
          if (Array.isArray(recordingsJson) && recordingsJson.length > 0) {
            // Tạo mảng mới để giữ dữ liệu ghi âm và đối tượng sound
            const loadedRecordings: RecordingData[] = await Promise.all(
              recordingsJson.map(async (rec, index) => {
                try {
                  // Kiểm tra xem file có tồn tại không
                  const fileInfo = await FileSystem.getInfoAsync(rec.uri);
                  if (!fileInfo.exists) {
                    console.log(`File không tồn tại: ${rec.uri}`);
                    return {
                      ...rec,
                      sound: undefined,
                      isPlaying: false,
                      fileExists: false,
                    };
                  }

                  // Tải âm thanh từ URI
                  console.log(`Đang tải âm thanh từ: ${rec.uri}`);
                  const { sound } = await Audio.Sound.createAsync(
                    { uri: rec.uri },
                    { shouldPlay: false }
                  );
                  return {
                    ...rec,
                    sound,
                    isPlaying: false,
                    fileExists: true,
                  };
                } catch (err) {
                  console.error(`Không thể tải âm thanh #${index + 1}:`, err);
                  return {
                    ...rec,
                    sound: undefined,
                    isPlaying: false,
                    fileExists: false,
                  };
                }
              })
            );

            // Lọc ra các bản ghi có thể phát được
            const validRecordings = loadedRecordings.filter(
              (rec) => rec.fileExists
            );
            if (validRecordings.length === 0 && loadedRecordings.length > 0) {
              // Nếu không có bản ghi nào hợp lệ
              Alert.alert(
                "Thông báo",
                "Không thể tải các bản ghi âm. Các file có thể đã bị xóa hoặc di chuyển."
              );
            } else if (validRecordings.length < loadedRecordings.length) {
              // Nếu chỉ một phần bản ghi hợp lệ
              Alert.alert(
                "Thông báo",
                `Đã tải ${validRecordings.length}/${loadedRecordings.length} bản ghi âm. Một số file có thể đã bị xóa.`
              );
            }

            setRecordings(validRecordings);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bản ghi âm:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu bản ghi âm");
      }
    };

    loadRecordings();

    // Dọn dẹp khi unmount
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }

      recordings.forEach((recording) => {
        if (recording.sound) {
          recording.sound.unloadAsync();
        }
      });
    };
  }, [params.recordings]);

  // Hàm phát âm thanh
  const playRecording = async (recording: RecordingData) => {
    try {
      console.log("Bắt đầu phát âm thanh", recording.id);

      // Đảm bảo chế độ âm thanh được cài đặt đúng
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Kiểm tra lại xem file có tồn tại không trước khi phát
      const fileInfo = await FileSystem.getInfoAsync(recording.uri);
      if (!fileInfo.exists) {
        Alert.alert("Thông báo", "File âm thanh không tồn tại hoặc đã bị xóa");
        // Cập nhật lại danh sách recordings để loại bỏ file không tồn tại
        setRecordings((prev) => prev.filter((rec) => rec.id !== recording.id));
        return;
      }

      // Dừng bản ghi đang phát (nếu có)
      if (currentSound) {
        console.log("Dừng âm thanh hiện tại");
        await currentSound.stopAsync();
        setCurrentSound(null);
      }

      // Tìm đối tượng sound từ recordings
      const currentRecording = recordings.find(
        (rec) => rec.id === recording.id
      );
      const soundToPlay = currentRecording?.sound;

      // Kiểm tra trạng thái âm thanh trước khi phát
      if (soundToPlay) {
        const status = await soundToPlay.getStatusAsync();
        console.log("Trạng thái âm thanh:", status);
      }

      // Đánh dấu tất cả các bản ghi là không đang phát
      setRecordings((prev) =>
        prev.map((rec) => ({ ...rec, isPlaying: rec.id === recording.id }))
      );

      // Phát bản ghi đã chọn
      if (soundToPlay) {
        console.log("Đang phát âm thanh...");
        await soundToPlay.setPositionAsync(0); // Đặt lại vị trí về đầu
        await soundToPlay.playAsync(); // Sử dụng playAsync thay vì replayAsync
        setCurrentSound(soundToPlay);

        // Lắng nghe sự kiện kết thúc phát
        soundToPlay.setOnPlaybackStatusUpdate((status) => {
          console.log("Cập nhật trạng thái phát:", status);
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            console.log("Âm thanh đã phát xong");
            setRecordings((prev) =>
              prev.map((rec) =>
                rec.id === recording.id ? { ...rec, isPlaying: false } : rec
              )
            );
            setCurrentSound(null);
          }
        });
      } else {
        Alert.alert("Thông báo", "Không thể phát bản ghi âm");
      }
    } catch (error) {
      console.error("Lỗi khi phát âm thanh", error);
      Alert.alert("Lỗi", "Không thể phát bản ghi âm");

      // Đặt lại trạng thái khi có lỗi
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id ? { ...rec, isPlaying: false } : rec
        )
      );
      setCurrentSound(null);
    }
  };

  // Sử dụng ngày từ params hoặc ngày hiện tại
  const currentDate = dateParam ? new Date(dateParam) : new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d").toUpperCase();
  const formattedTime = format(currentDate, "HH:mm");
  const dayNumber = format(currentDate, "d");
  const dayName = format(currentDate, "EEEE");
  const monthName = format(currentDate, "MMMM");

  // Dữ liệu card
  const cardData = {
    date: formattedDate,
    time: formattedTime,
    emoji: emojiMap[moodId],
    title: moodTitles[moodId] || "How I feel today",
    note:
      note ||
      'Lorem ipsum...\n"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."\n\nLorem ipsum...\n\nLorem ipsum...',
    hasImages: true, // Đổi thành true nếu có hình ảnh thực tế
    hasMusic: true,
    music: {
      title: "Shape of you",
    },
  };

  // Xử lý quay về trang chính
  const handleBackToHome = () => {
    try {
      router.push("/(main)" as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Xử lý chuyển đến trang chỉnh sửa
  const handleEdit = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Xử lý khi nhấn phát nhạc
  const handlePlayMusic = () => {
    console.log("Play music:", cardData.music.title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header với nút back, ngày giờ và nút edit */}
          <DateTimeHeader
            dayName={dayName}
            dayNumber={dayNumber}
            monthName={monthName}
            formattedTime={formattedTime}
            onBack={handleBackToHome}
            onEdit={handleEdit}
          />

          {/* Emoji */}
          <EmojiDisplay moodId={moodId} />

          {/* Note Card */}
          <NoteCard moodId={moodId} note={cardData.note} />

          {/* Images Grid */}
          {cardData.hasImages && <ImagesGrid />}

          {/* Audio Recordings */}
          <RecordingsList
            recordings={recordings}
            onPlayRecording={playRecording}
          />

          {/* Music Player */}
          {cardData.hasMusic && (
            <MusicPlayer
              musicTitle={cardData.music.title}
              onPlayMusic={handlePlayMusic}
            />
          )}
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
});
