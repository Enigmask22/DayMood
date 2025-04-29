import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Ionicons,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { wp, hp } from "@/components/newemoji/utils";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

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
type RecordingData = {
  id: number;
  uri: string;
  duration: string;
  sound?: Audio.Sound;
  isPlaying?: boolean;
  fileExists: boolean;
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

      // Kiểm tra trạng thái âm thanh trước khi phát
      if (recording.sound) {
        const status = await recording.sound.getStatusAsync();
        console.log("Trạng thái âm thanh:", status);
      }

      // Đánh dấu tất cả các bản ghi là không đang phát
      setRecordings((prev) =>
        prev.map((rec) => ({ ...rec, isPlaying: rec.id === recording.id }))
      );

      // Phát bản ghi đã chọn
      if (recording.sound) {
        console.log("Đang phát âm thanh...");
        await recording.sound.setPositionAsync(0); // Đặt lại vị trí về đầu
        await recording.sound.playAsync(); // Sử dụng playAsync thay vì replayAsync
        setCurrentSound(recording.sound);

        // Lắng nghe sự kiện kết thúc phát
        recording.sound.setOnPlaybackStatusUpdate((status) => {
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

  const [backPressed, setBackPressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header với nút back, ngày giờ và nút edit */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#E0F7ED", "#B9F0DA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.buttonGradient,
                backPressed && styles.buttonPressed,
              ]}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToHome}
                onPressIn={() => setBackPressed(true)}
                onPressOut={() => setBackPressed(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={wp(6)} color="#32B768" />
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={["#D5F7E5", "#E8F9F0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dateTimeContainer}
            >
              <View style={styles.dateRow}>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={wp(4.5)}
                  color="#32B768"
                />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <View style={styles.dateDetails}>
                    <Text style={styles.dayNumber}>{dayNumber}</Text>
                    <Text style={styles.monthName}>{monthName}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.timeRow}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={wp(4.5)}
                  color="#32B768"
                />
                <Text style={styles.timeText}>{formattedTime}</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#E0F7ED", "#B9F0DA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.buttonGradient,
                editPressed && styles.buttonPressed,
              ]}
            >
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
                onPressIn={() => setEditPressed(true)}
                onPressOut={() => setEditPressed(false)}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={wp(5)} color="#32B768" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Emoji */}
          <View style={styles.emojiContainer}>
            <Image
              source={cardData.emoji}
              style={styles.emojiImage}
              contentFit="contain"
              autoplay={true}
            />
          </View>

          {/* Note Card */}
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{cardData.title}</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.noteText}>{cardData.note}</Text>
          </View>

          {/* Images Grid - Sử dụng View màu thay vì hình ảnh */}
          {cardData.hasImages && (
            <View style={styles.imagesGrid}>
              {[1, 2, 3, 4].map((_, index) => (
                <View key={index} style={styles.placeholderImage} />
              ))}
            </View>
          )}

          {/* Audio Recordings */}
          {recordings.length > 0 && (
            <View style={styles.recordingsContainer}>
              <View style={styles.recordingsHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome5 name="headphones" size={wp(4.5)} color="#333" />
                  <Text style={styles.sectionTitle}>Audio Recordings</Text>
                </View>
              </View>

              <View style={styles.recordingsList}>
                {recordings.map((recording) => (
                  <View key={recording.id} style={styles.recordingItem}>
                    <View style={styles.recordingInfo}>
                      <View
                        style={[
                          styles.recordingIconContainer,
                          recording.isPlaying &&
                            styles.recordingIconContainerActive,
                        ]}
                      >
                        <FontAwesome5
                          name={recording.isPlaying ? "volume-up" : "music"}
                          size={wp(4)}
                          color={recording.isPlaying ? "#fff" : "#32B768"}
                        />
                      </View>
                      <Text style={styles.recordingTitle}>
                        Bản ghi #{recording.id + 1}
                        <Text style={styles.recordingDuration}>
                          {" "}
                          | {recording.duration}
                        </Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playRecording(recording)}
                    >
                      <LinearGradient
                        colors={
                          recording.isPlaying
                            ? ["#ff6b6b", "#ff5252"]
                            : ["#32B768", "#27A35A"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.playButtonGradient}
                      >
                        <FontAwesome5
                          name={recording.isPlaying ? "pause" : "play"}
                          size={wp(3.5)}
                          color="#fff"
                        />
                        <Text style={styles.playButtonText}>
                          {recording.isPlaying ? "DỪNG" : "PHÁT"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Music Player */}
          {cardData.hasMusic && (
            <View style={styles.musicPlayer}>
              <FontAwesome5 name="music" size={wp(5)} color="#333" />
              <Text style={styles.musicTitle}>{cardData.music.title}</Text>
              <TouchableOpacity style={styles.playButton}>
                <LinearGradient
                  colors={["#32B768", "#27A35A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.musicPlayButton}
                >
                  <Ionicons name="play" size={wp(4)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  buttonGradient: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.2)",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderColor: "rgba(50, 183, 104, 0.4)",
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeContainer: {
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: wp(50),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.6),
    width: "100%",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dateTextContainer: {
    marginLeft: wp(2),
    flex: 1,
  },
  dayName: {
    fontSize: wp(3),
    color: "#333",
    fontFamily: "Quicksand-SemiBold",
    textTransform: "uppercase",
  },
  dateDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayNumber: {
    fontSize: wp(4),
    color: "#32B768",
    fontFamily: "Quicksand-Bold",
    marginRight: wp(1),
  },
  monthName: {
    fontSize: wp(3),
    color: "#555",
    fontFamily: "Quicksand-Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(50, 183, 104, 0.2)",
    width: "100%",
    marginVertical: hp(0.5),
  },
  timeText: {
    fontSize: wp(4.2),
    color: "#333",
    fontFamily: "Quicksand-Bold",
    marginLeft: wp(2),
  },
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(2),
  },
  emojiImage: {
    width: wp(20),
    height: wp(20),
  },
  noteCard: {
    backgroundColor: "#FFFFC0", // Màu vàng nhạt
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: hp(3),
  },
  noteTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
    textAlign: "center",
    color: "#333",
  },
  titleUnderline: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: hp(1),
    width: "90%",
    alignSelf: "center",
  },
  noteText: {
    fontSize: wp(3.8),
    color: "#333",
    fontFamily: "Quicksand-Regular",
    lineHeight: wp(5.5),
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: hp(3),
  },
  placeholderImage: {
    width: wp(42),
    height: wp(30),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    backgroundColor: "#87CEEB", // Màu xanh da trời nhạt làm placeholder
  },
  recordingsContainer: {
    marginBottom: hp(3),
    backgroundColor: "#e6f9f0",
    borderRadius: wp(3),
    padding: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.2)",
  },
  recordingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingBottom: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(50, 183, 104, 0.2)",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  recordingsList: {
    gap: hp(1.5),
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordingIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "rgba(50, 183, 104, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2.5),
  },
  recordingIconContainerActive: {
    backgroundColor: "#ff5252",
  },
  recordingTitle: {
    fontSize: wp(3.8),
    color: "#333",
    fontFamily: "Quicksand-Bold",
  },
  recordingDuration: {
    fontSize: wp(3.5),
    color: "#666",
    fontFamily: "Quicksand-Regular",
  },
  playButton: {
    borderRadius: wp(5),
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(5),
  },
  playButtonText: {
    fontSize: wp(3.3),
    color: "#fff",
    fontWeight: "bold",
    marginLeft: wp(1.5),
    fontFamily: "Quicksand-Bold",
    letterSpacing: 0.5,
  },
  musicPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FFF0",
    padding: wp(4),
    borderRadius: wp(10),
  },
  musicTitle: {
    fontSize: wp(4),
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
  musicPlayButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FFF0",
    padding: wp(4),
    borderRadius: wp(10),
    marginBottom: hp(2),
  },
  audioDuration: {
    fontSize: wp(4),
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
});
