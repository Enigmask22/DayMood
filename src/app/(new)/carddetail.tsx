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
import "react-native-get-random-values"; // Cần thiết cho uuid
import { uploadFileFromBase64, uploadAudioFromUri } from "@/utils/fileService";

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
  isMusic?: boolean;
  name?: string;
}

// Hàm trích xuất tiêu đề và nội dung từ ghi chú
const extractTitleAndContent = (noteText: string) => {
  if (!noteText) return { title: "", content: "" };

  const lines = noteText.split("\n");
  if (lines.length > 1) {
    return {
      title: lines[0],
      content: lines.slice(1).join("\n").trim(),
    };
  } else {
    return { title: "", content: noteText };
  }
};

export default function CardDetailScreen() {
  // Nhận các tham số từ navigation
  const params = useLocalSearchParams();
  const moodId = params.mood ? parseInt(params.mood as string) : 4; // Default to joyful
  const note = (params.note as string) || "";
  const dateParam = params.date as string;

  // Xử lý dữ liệu bản ghi âm
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  // Xử lý dữ liệu hình ảnh
  const [images, setImages] = useState<string[]>([]);

  // Tải dữ liệu hình ảnh từ params
  useEffect(() => {
    try {
      // console.log("params.images:", params.images);
      if (
        params.images &&
        typeof params.images === "string" &&
        params.images !== ""
      ) {
        const parsedImages = JSON.parse(params.images);
        // console.log("Ảnh đã parse:", parsedImages);

        // Đơn giản hóa cách xử lý - chỉ cần mảng URI hợp lệ
        if (Array.isArray(parsedImages)) {
          // Lọc ra các URI có giá trị
          const validImages = parsedImages.filter(
            (uri) =>
              uri &&
              typeof uri === "string" &&
              (uri.startsWith("data:image") ||
                uri.startsWith("file://") ||
                uri.startsWith("http"))
          );

          // console.log("Đường dẫn ảnh hợp lệ:", validImages);
          setImages(validImages);
          console.log("Số lượng ảnh đã set:", validImages.length);
        }
      }
    } catch (error) {
      console.error("Lỗi khi phân tích dữ liệu hình ảnh:", error);
    }
  }, [params.images]);

  // Tải dữ liệu bản ghi âm từ params
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        if (params.recordings && params.recordings !== "") {
          console.log("Raw recordings data:", params.recordings);
          const recordingsJson = JSON.parse(params.recordings as string);
          console.log("Parsed recordings data:", recordingsJson);

          if (Array.isArray(recordingsJson) && recordingsJson.length > 0) {
            // Tạo mảng mới để giữ dữ liệu ghi âm và đối tượng sound
            const loadedRecordings: RecordingData[] = await Promise.all(
              recordingsJson.map(async (rec, index) => {
                try {
                  // Kiểm tra xem file có tồn tại không
                  console.log(`Đang kiểm tra file: ${rec.uri}`);
                  const fileInfo = await FileSystem.getInfoAsync(rec.uri);
                  console.log(`Thông tin file #${index}:`, fileInfo);

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

                  // Kiểm tra trạng thái âm thanh
                  const status = await sound.getStatusAsync();
                  console.log(`Trạng thái âm thanh #${index}:`, status);

                  return {
                    ...rec,
                    sound,
                    isPlaying: false,
                    fileExists: true,
                    // Giữ nguyên thông tin isMusic và name từ dữ liệu gốc
                    isMusic: rec.isMusic || false,
                    name: rec.name || `Bản ghi #${index + 1}`,
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

            console.log("Tất cả bản ghi đã được tải:", loadedRecordings);

            // Lọc ra các bản ghi có thể phát được
            const validRecordings = loadedRecordings.filter(
              (rec) => rec.fileExists
            );

            console.log(
              `Số bản ghi hợp lệ: ${validRecordings.length}/${loadedRecordings.length}`
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
          } else {
            console.log("Không có bản ghi hoặc định dạng không hợp lệ");
          }
        } else {
          console.log("Không có dữ liệu bản ghi âm");
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
      console.log("Kiểm tra file trước khi phát:", fileInfo);

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
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Tìm đối tượng sound từ recordings
      const currentRecording = recordings.find(
        (rec) => rec.id === recording.id
      );

      if (!currentRecording || !currentRecording.sound) {
        console.log("Không tìm thấy bản ghi hoặc sound không tồn tại");
        Alert.alert("Lỗi", "Không thể phát âm thanh");
        return;
      }

      const soundToPlay = currentRecording.sound;

      // Kiểm tra trạng thái âm thanh trước khi phát
      const status = await soundToPlay.getStatusAsync();
      console.log("Trạng thái âm thanh trước khi phát:", status);

      // Đánh dấu tất cả các bản ghi là không đang phát
      setRecordings((prev) =>
        prev.map((rec) => ({ ...rec, isPlaying: rec.id === recording.id }))
      );

      // Phát bản ghi đã chọn
      console.log("Đang phát âm thanh...");
      await soundToPlay.setPositionAsync(0); // Đặt lại vị trí về đầu
      await soundToPlay.playAsync(); // Sử dụng playAsync thay vì replayAsync
      setCurrentSound(soundToPlay);

      // Lắng nghe sự kiện kết thúc phát
      soundToPlay.setOnPlaybackStatusUpdate((status) => {
        console.log("Cập nhật trạng thái phát:", status);
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          console.log("Âm thanh đã phát xong");
          // Đặt lại trạng thái isPlaying
          setRecordings((prev) =>
            prev.map((rec) =>
              rec.id === recording.id ? { ...rec, isPlaying: false } : rec
            )
          );
          setCurrentSound(null);
        }
      });
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
      Alert.alert("Lỗi", "Không thể phát âm thanh");
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id ? { ...rec, isPlaying: false } : rec
        )
      );
    }
  };

  // Đoạn chuẩn bị dữ liệu cho hiển thị
  const date = dateParam ? new Date(dateParam) : new Date();
  const dayName = format(date, "EEEE");
  const dayNumber = format(date, "d");
  const monthName = format(date, "MMMM");
  const formattedTime = format(date, "HH:mm");

  // Xác định music recordings nếu có
  const [musicRecording, setMusicRecording] = useState<RecordingData | null>(
    null
  );
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);

  // Tách ra bản ghi nhạc (nếu có) cho player riêng
  useEffect(() => {
    if (recordings.length > 0) {
      const music = recordings.find((rec) => rec.isMusic === true);
      if (music) {
        setMusicRecording(music);
      }
    }
  }, [recordings]);

  // Xử lý phát nhạc
  const handlePlayMusic = () => {
    if (musicRecording) {
      // Nếu đang phát thì dừng, nếu đang dừng thì phát
      if (musicIsPlaying) {
        // Logic dừng nhạc
        if (currentSound) {
          currentSound.stopAsync();
          setCurrentSound(null);
        }
        setMusicIsPlaying(false);

        // Cập nhật trạng thái của recording
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === musicRecording.id ? { ...rec, isPlaying: false } : rec
          )
        );
      } else {
        // Logic phát nhạc
        playRecording(musicRecording);
        setMusicIsPlaying(true);
      }
    }
  };

  // Chuẩn bị danh sách activities nếu có
  const [activities, setActivities] = useState<number[]>([]);
  useEffect(() => {
    if (params.activities && typeof params.activities === "string") {
      const activityIds = params.activities
        .split(",")
        .map((id) => parseInt(id));
      setActivities(activityIds.filter((id) => !isNaN(id)));
    }
  }, [params.activities]);

  // Extract title and content from note
  const { title: extractedTitle, content: noteContent } =
    extractTitleAndContent(note);
  // Use title from note if available, otherwise use default from mood
  const noteTitle = extractedTitle || moodTitles[moodId] || "How I feel today";

  // Dữ liệu card
  const cardData = {
    date: formattedTime,
    time: formattedTime,
    emoji: emojiMap[moodId],
    title: moodTitles[moodId] || "How I feel today",
    note:
      note ||
      'Lorem ipsum...\n"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."\n\nLorem ipsum...\n\nLorem ipsum...',
    hasImages: images.length > 0, // Chỉ true nếu thực sự có hình ảnh
    hasMusic: true,
    music: {
      title: "Shape of you",
    },
  };

  // Xử lý quay về trang chính
  const handleBackToHome = async () => {
    try {
      // Hiển thị loading alert
      Alert.alert("Đang xử lý", "Đang lưu dữ liệu và tải lên file media...", [
        { text: "OK", style: "default" },
      ]);

      // Lấy tiêu đề từ note nếu có, hoặc sử dụng tiêu đề từ mood
      const { title: extractedTitle } = extractTitleAndContent(note);
      const noteTitle =
        extractedTitle || moodTitles[moodId] || "How I feel today";

      // Chuẩn bị dữ liệu record với dữ liệu từ params - theo cấu trúc API mới
      const recordData = {
        title: noteTitle,
        content: noteContent,
        mood_id: moodId,
        user_id: 1,
        activity_id: activities,
        status: "ACTIVE",
      };

      console.log("Bắt đầu tạo record:", recordData);

      // Tạo record với activities đã đính kèm
      const recordResponse = await fetch(
        "http://192.168.2.7:8000/api/v1/records",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        }
      );

      if (!recordResponse.ok) {
        const responseText = await recordResponse.text();
        console.log("Response status:", recordResponse.status);
        console.log("Response text:", responseText);
        throw new Error(
          "Không thể tạo record. Status: " +
            recordResponse.status +
            " - " +
            responseText
        );
      }

      const recordResult = await recordResponse.json();
      const recordId = recordResult.id;
      console.log("Đã tạo record với ID:", recordId);

      // Upload hình ảnh lên Supabase và lưu thông tin vào database
      if (images.length > 0) {
        console.log(`Đang tải lên ${images.length} hình ảnh`);

        // Upload từng hình ảnh lên Supabase
        for (const imageBase64 of images) {
          try {
            // Upload lên Supabase Storage
            const fileInfo = await uploadFileFromBase64(
              imageBase64,
              "image/jpeg",
              "images",
              `user_1` // thay bằng user ID thực
            );

            console.log("File đã upload:", fileInfo);

            // Lưu thông tin file vào database
            await fetch("http://192.168.2.7:8000/api/v1/files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fname: fileInfo.fileName,
                type: fileInfo.fileType,
                url: fileInfo.url,
                fkey: fileInfo.key,
                size: fileInfo.size,
                record_id: recordId,
                user_id: 1,
              }),
            });
          } catch (error) {
            console.error("Lỗi khi upload hình ảnh:", error);
          }
        }
      }

      // Upload recordings
      if (recordings.length > 0) {
        console.log(`Đang tải lên ${recordings.length} bản ghi âm`);

        for (const recording of recordings) {
          try {
            // Upload lên Supabase Storage
            const fileInfo = await uploadAudioFromUri(
              recording.uri,
              recording.isMusic ? "audio/mpeg" : "audio/m4a",
              `user_1` // thay bằng user ID thực
            );

            // Lưu thông tin file vào database
            await fetch("http://192.168.2.7:8000/api/v1/files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fname: recording.name || `Recording ${recording.id}`,
                type: recording.isMusic ? "audio/mpeg" : "audio/m4a",
                url: fileInfo.url,
                fkey: fileInfo.key,
                size: fileInfo.size,
                record_id: recordId,
              }),
            });
          } catch (error) {
            console.error("Lỗi khi upload bản ghi âm:", error);
          }
        }
      }

      // Hiển thị thông báo thành công
      Alert.alert("Thành công", "Đã lưu ghi chú và tải lên media thành công!", [
        { text: "OK", style: "default" },
      ]);

      // Điều hướng về trang chủ
      router.push("/(main)" as any);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      Alert.alert(
        "Lỗi",
        "Không thể lưu dữ liệu. Vui lòng thử lại sau. " + error,
        [{ text: "OK", style: "cancel" }]
      );
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

  // Hiển thị trước khi trả về JSX để kiểm tra
  console.log("Trước render - Số lượng ảnh:", images.length);
  console.log("hasImages:", cardData.hasImages);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hiển thị ngày và thời gian */}
          <DateTimeHeader
            dayName={dayName}
            dayNumber={dayNumber}
            monthName={monthName}
            formattedTime={formattedTime}
            onBack={handleBackToHome}
            onEdit={handleEdit}
          />

          {/* Hiển thị emoji tương ứng với mood */}
          <EmojiDisplay moodId={moodId} />

          {/* Hiển thị ghi chú - đã tách title và content trước khi truyền vào NoteCard */}
          {note && <NoteCard title={noteTitle} content={noteContent} />}

          {/* Hiển thị hình ảnh nếu có */}
          {images.length > 0 && <ImagesGrid images={images} />}

          {/* Hiển thị danh sách bản ghi âm */}
          {recordings.length > 0 && (
            <RecordingsList
              recordings={recordings}
              onPlayRecording={playRecording}
            />
          )}

          {/* Hiển thị player nhạc nếu có */}
          {/* {musicRecording && (
            <MusicPlayer
              musicTitle={musicRecording.name || "Nhạc nền"}
              onPlayMusic={handlePlayMusic}
            />
          )} */}
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
