import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
  Button,
  Animated,
  Easing,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Header from "@/components/newemoji/Header";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import { wp, hp } from "@/components/newemoji/utils";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

// Định nghĩa các hoạt động - Cập nhật thành 16 hoạt động để hiển thị đủ 4 hàng
const activities = [
  { id: 1, name: "Work", icon: "briefcase" },
  { id: 2, name: "Sport", icon: "running" },
  { id: 3, name: "Walking", icon: "walking" },
  { id: 4, name: "Exercise", icon: "bicycle" },
  { id: 5, name: "Music", icon: "headphones" },
  { id: 6, name: "Dishes", icon: "utensils" },
  { id: 7, name: "Reading", icon: "book-open" },
  { id: 8, name: "Study", icon: "book" },
  { id: 9, name: "Sleep", icon: "bed" },
  { id: 10, name: "Camping", icon: "campground" },
  { id: 11, name: "Shopping", icon: "shopping-cart" },
  { id: 12, name: "Travel", icon: "map-marker-alt" },
  { id: 13, name: "Chat", icon: "comments" },
  { id: 14, name: "Coffee", icon: "coffee" },
  { id: 15, name: "Swimming", icon: "swimmer" },
  { id: 16, name: "More", icon: "plus" },
];

// Map emoji IDs to emoji images
const emojiMap: { [key: number]: any } = {
  1: require("@/assets/emoji/sad.gif"),
  2: require("@/assets/emoji/angry.gif"),
  3: require("@/assets/emoji/normal.gif"),
  4: require("@/assets/emoji/joyful.gif"),
  5: require("@/assets/emoji/excellent.gif"),
  // Add more emojis as needed
};

export default function ActivityScreen() {
  // Lấy tham số từ URL
  const params = useLocalSearchParams();
  const { initialDate, selectedMood } = params;
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [recordings, setRecordings] = useState<
    {
      sound?: Audio.Sound;
      duration: string;
      file: string;
      isPlaying?: boolean;
    }[]
  >([]);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isListening, setIsListening] = useState(false);
  const [date, setDate] = useState<Date>(() => {
    if (initialDate && typeof initialDate === "string") {
      return new Date(initialDate);
    }
    return new Date();
  });

  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [isFullNoteOpen, setIsFullNoteOpen] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const [savePressed, setSavePressed] = useState(false);

  // Lấy emoji tương ứng với mood
  const moodId = selectedMood ? parseInt(selectedMood as string) : null;
  const emojiSource =
    moodId && emojiMap[moodId] ? emojiMap[moodId] : emojiMap[4]; // Default to normal

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Cập nhật date khi initialDate thay đổi
  useEffect(() => {
    if (initialDate && typeof initialDate === "string") {
      setDate(new Date(initialDate));
    }
  }, [initialDate]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }

      // Giải phóng tất cả các sound khi unmount component
      recordings.forEach((recordingLine) => {
        recordingLine.sound?.unloadAsync();
      });
    };
  }, [recording, recordings]);

  // Cài đặt animation nhấp nháy cho chỉ báo ghi âm
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }

    return () => {
      fadeAnim.setValue(1);
    };
  }, [recording, fadeAnim]);

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

  async function startRecording() {
    try {
      // Kiểm tra nếu đã có quyền ghi âm
      if (!permissionResponse?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert("Thông báo", "Cần quyền truy cập microphone để ghi âm");
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Tạo thư mục audio nếu chưa tồn tại
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(audioDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      }

      console.log("Bắt đầu ghi âm...");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Không thể bắt đầu ghi âm", err);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm");
    }
  }

  async function stopRecording() {
    console.log("Dừng ghi âm...");
    if (!recording) {
      console.log("Không có bản ghi âm nào đang hoạt động");
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("URI bản ghi (tạm thời): ", uri);

      if (!uri) {
        throw new Error("URI ghi âm không hợp lệ");
      }

      // Lưu file vào thư mục cố định
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const fileName = `recording-${Date.now()}.m4a`;
      const permanentUri = `${audioDir}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: permanentUri,
      });

      console.log("URI bản ghi (cố định): ", permanentUri);

      // Không tạo sound ở đây, chỉ lưu trữ thông tin và URI
      const durationMillis = await getDurationMillis(permanentUri);

      const newRecordings = [
        ...recordings,
        {
          duration: getDurationFormatted(durationMillis || 0),
          file: permanentUri,
          isPlaying: false,
        },
      ];

      setRecordings(newRecordings);
      setRecording(undefined);
    } catch (err) {
      console.error("Lỗi khi dừng ghi âm", err);
      Alert.alert("Lỗi", "Không thể hoàn thành việc ghi âm");
      setRecording(undefined);
    }
  }

  // Hàm để lấy thời lượng của file âm thanh
  async function getDurationMillis(uri: string): Promise<number | null> {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );

      if (!status.isLoaded || !status.durationMillis) {
        await sound.unloadAsync();
        return null;
      }

      const duration = status.durationMillis;
      await sound.unloadAsync();
      return duration;
    } catch (error) {
      console.error("Lỗi khi lấy thời lượng âm thanh:", error);
      return null;
    }
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 1000 / 60;
    const minutesPart = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesPart) * 60);
    return seconds < 10
      ? `${minutesPart}:0${seconds}`
      : `${minutesPart}:${seconds}`;
  }

  async function playRecording(index: number) {
    try {
      console.log("Bắt đầu phát âm thanh", index);

      // Đảm bảo chế độ âm thanh được cài đặt đúng
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Dừng âm thanh hiện tại nếu đang phát
      if (currentSound) {
        console.log("Dừng âm thanh hiện tại");
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Lấy URI của file âm thanh
      const fileUri = recordings[index].file;
      console.log("Loading sound from URI:", fileUri);

      // Tạo mới đối tượng âm thanh từ URI
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );

      // Kiểm tra trạng thái mới tạo
      const status = await newSound.getStatusAsync();
      console.log("Trạng thái âm thanh mới tạo:", status);

      if (!status.isLoaded) {
        console.error("Âm thanh không được tải: isLoaded = false");
        Alert.alert("Lỗi", "Không thể tải âm thanh");
        return;
      }

      // Cập nhật trạng thái isPlaying
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec, idx) => ({
          ...rec,
          isPlaying: idx === index,
        }))
      );

      // Phát âm thanh
      console.log("Đang phát âm thanh...");
      await newSound.playAsync();
      setCurrentSound(newSound);

      // Cài đặt callback khi âm thanh kết thúc
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        console.log("Cập nhật trạng thái phát:", status);
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          console.log("Âm thanh đã phát xong");
          // Đặt lại trạng thái khi phát xong
          setRecordings((prevRecordings) =>
            prevRecordings.map((rec) => ({
              ...rec,
              isPlaying: false,
            }))
          );
          await newSound.unloadAsync();
          setCurrentSound(null);
        }
      });
    } catch (error) {
      console.error("Lỗi khi phát âm thanh", error);
      Alert.alert("Lỗi", "Không thể phát bản ghi âm");

      // Đặt lại trạng thái khi có lỗi
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec) => ({
          ...rec,
          isPlaying: false,
        }))
      );
      setCurrentSound(null);
    }
  }

  async function stopPlayback(index: number) {
    try {
      console.log("Dừng phát âm thanh", index);
      if (currentSound) {
        await currentSound.pauseAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Cập nhật trạng thái isPlaying
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec) => ({
          ...rec,
          isPlaying: false,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi dừng phát âm thanh", error);
    }
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      const isPlaying = recordingLine.isPlaying || false;

      return (
        <View key={index} style={styles.recordingItem}>
          <View style={styles.recordingInfo}>
            <View
              style={[
                styles.recordingIconContainer,
                isPlaying && styles.recordingIconContainerActive,
              ]}
            >
              <FontAwesome5
                name={isPlaying ? "volume-up" : "music"}
                size={wp(4)}
                color={isPlaying ? "#fff" : "#32B768"}
              />
            </View>
            <Text style={styles.recordingTitle}>
              Bản ghi #{index + 1}{" "}
              <Text style={styles.recordingDuration}>
                | {recordingLine.duration}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() =>
              isPlaying ? stopPlayback(index) : playRecording(index)
            }
          >
            <LinearGradient
              colors={
                isPlaying ? ["#ff6b6b", "#ff5252"] : ["#32B768", "#27A35A"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <FontAwesome5
                name={isPlaying ? "pause" : "play"}
                size={wp(3.5)}
                color="#fff"
              />
              <Text style={styles.playButtonText}>
                {isPlaying ? "DỪNG" : "PHÁT"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    });
  }

  function clearRecordings() {
    // Dừng tất cả âm thanh đang phát trước
    if (currentSound) {
      currentSound
        .stopAsync()
        .then(() => currentSound.unloadAsync())
        .catch((err) => console.error("Lỗi khi dừng âm thanh", err));
      setCurrentSound(null);
    }

    setRecordings([]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Back button với emoji */}
          <View style={styles.backHeader}>
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
                onPress={handleBack}
                onPressIn={() => setBackPressed(true)}
                onPressOut={() => setBackPressed(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={wp(6)} color="#32B768" />
              </TouchableOpacity>
            </LinearGradient>
            <Image source={emojiSource} style={styles.emojiImage} />
          </View>

          {/* Tiêu đề - bọc trong container căn giữa */}
          <View style={styles.headerContainer}>
            <Header title="What did you do?" />
          </View>

          {/* Date Time Selector */}
          <DateTimeSelector date={date} setDate={setDate} />

          {/* Activities */}
          <View style={styles.activitiesSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>ACTIVITIES</Text>
              <View style={styles.sectionTitleLine} />
            </View>
            <View style={styles.activitiesGrid}>
              {activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    selectedActivities.includes(activity.id) &&
                      styles.selectedActivity,
                  ]}
                  onPress={() => handleActivitySelect(activity.id)}
                >
                  <FontAwesome5
                    name={activity.icon}
                    size={
                      selectedActivities.includes(activity.id) ? wp(5.5) : wp(5)
                    }
                    color={
                      selectedActivities.includes(activity.id)
                        ? "#006400"
                        : "#fff"
                    }
                  />
                  <Text
                    style={[
                      styles.activityName,
                      selectedActivities.includes(activity.id) &&
                        styles.selectedActivityName,
                    ]}
                  >
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.selectActivitiesContainer}>
              <View style={styles.selectActivitiesArrow} />
              <Text style={styles.selectActivitiesText}>
                Select your activities ...
              </Text>
            </View>
          </View>

          {/* Note Section */}
          <View style={styles.noteSection}>
            <View style={styles.noteHeader}>
              <View style={styles.noteIcon}>
                <MaterialIcons name="edit" size={wp(5)} color="#333" />
                <Text style={styles.noteTitle}>Your note</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFullNoteOpen(!isFullNoteOpen)}
              >
                <Text style={styles.openFullNote}>Open full note</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Write something..."
              placeholderTextColor="#666"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Image Section */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaTitleContainer}>
              <MaterialIcons name="image" size={wp(5)} color="#333" />
              <Text style={styles.mediaTitle}>Image</Text>
            </View>
            <View style={styles.mediaButtonsContainer}>
              <TouchableOpacity style={styles.mediaButton}>
                <FontAwesome name="camera" size={wp(5)} color="#333" />
                <Text style={styles.mediaButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton}>
                <FontAwesome name="image" size={wp(5)} color="#333" />
                <Text style={styles.mediaButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audio Section */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaTitleContainer}>
              <FontAwesome5 name="microphone" size={wp(5)} color="#333" />
              <Text style={styles.mediaTitle}>Audio</Text>
            </View>
            <View style={styles.mediaButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  recording && styles.recordingActive,
                ]}
                onPress={recording ? stopRecording : startRecording}
              >
                <FontAwesome5
                  name={recording ? "stop" : "wave-square"}
                  size={wp(5)}
                  color={recording ? "#FF0000" : "#333"}
                />
                <Text
                  style={[
                    styles.mediaButtonText,
                    recording && styles.recordingText,
                  ]}
                >
                  {recording ? "Recording..." : "Tap to record"}
                </Text>
                {recording && (
                  <View style={styles.recordingIndicator}>
                    <Animated.View
                      style={[styles.recordingDot, { opacity: fadeAnim }]}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton}>
                <FontAwesome5 name="music" size={wp(5)} color="#333" />
                <Text style={styles.mediaButtonText}>Add music here</Text>
              </TouchableOpacity>
            </View>

            {recordings.length > 0 && (
              <View style={styles.recordingsContainer}>
                <View style={styles.recordingsHeader}>
                  <View style={styles.recordingsTitleContainer}>
                    <FontAwesome5 name="headphones" size={wp(4)} color="#333" />
                    <Text style={styles.recordingsTitle}>Recordings</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.clearRecordingsButton}
                    onPress={clearRecordings}
                  >
                    <Text style={styles.clearRecordings}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recordingsList}>{getRecordingLines()}</View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <LinearGradient
            colors={["#32B768", "#27A35A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.saveGradient,
              savePressed && styles.saveButtonPressed,
            ]}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              onPressIn={() => setSavePressed(true)}
              onPressOut={() => setSavePressed(false)}
              activeOpacity={0.9}
            >
              <Ionicons name="checkmark" size={wp(8)} color="#fff" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  backHeader: {
    flexDirection: "row",
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
  emojiImage: {
    width: wp(8),
    height: wp(8),
    marginLeft: wp(2),
  },
  headerContainer: {
    alignItems: "center",
  },
  activitiesSection: {
    marginTop: hp(2.5),
  },
  sectionTitleContainer: {
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
    letterSpacing: 1.5,
    color: "#333",
  },
  sectionTitleLine: {
    width: wp(30),
    height: hp(0.3),
    backgroundColor: "#333",
    marginTop: hp(0.5),
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#00A67E",
    borderRadius: wp(4),
    padding: wp(3.5),
    paddingVertical: hp(2),
  },
  activityItem: {
    width: "23%", // Để 4 items mỗi hàng với một chút khoảng cách
    aspectRatio: 1.1, // Hơi bẹt xuống 1 chút để giảm chiều cao tổng thể
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.2),
    borderRadius: wp(15),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  selectedActivity: {
    backgroundColor: "#90EE90", // Màu xanh lá nhạt hơn, gần với thiết kế
    borderWidth: 1.5,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  activityName: {
    fontSize: wp(2.8),
    color: "#fff",
    marginTop: hp(0.5),
    textAlign: "center",
    fontFamily: "Quicksand-Regular",
  },
  selectedActivityName: {
    fontWeight: "bold",
  },
  selectActivitiesContainer: {
    backgroundColor: "white",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(6),
    borderRadius: wp(10),
    marginTop: hp(1.5),
    position: "relative",
    alignSelf: "center",
    width: "65%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectActivitiesArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: wp(2.5),
    borderRightWidth: wp(2.5),
    borderBottomWidth: wp(2.5),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    position: "absolute",
    top: -wp(2.5),
    alignSelf: "center",
  },
  selectActivitiesText: {
    fontSize: wp(4),
    color: "#888",
    textAlign: "center",
    fontFamily: "Quicksand-Regular",
  },
  noteSection: {
    marginTop: hp(2.5),
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  noteIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  openFullNote: {
    fontSize: wp(3.5),
    color: "#666",
    fontFamily: "Quicksand-Bold",
  },
  noteInput: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(3),
    minHeight: hp(6),
    fontFamily: "Quicksand-Regular",
    fontSize: wp(4),
    color: "#333",
  },
  mediaSection: {
    marginTop: hp(2.5),
  },
  mediaTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  mediaTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFD0", // Light yellow background
    borderRadius: wp(10),
    padding: wp(3),
    width: "48%",
  },
  mediaButtonText: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
  saveGradient: {
    borderRadius: wp(10),
    marginTop: hp(4),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: wp(5),
    color: "#fff",
    marginLeft: wp(2),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
  },
  recordingActive: {
    backgroundColor: "#FFEBEB",
    borderWidth: 1,
    borderColor: "#FF0000",
  },
  recordingText: {
    color: "#FF0000",
    fontWeight: "bold",
  },
  recordingIndicator: {
    marginLeft: wp(2),
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: "#FF0000",
  },
  recordingsContainer: {
    marginTop: hp(2),
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
  recordingsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingsTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
    color: "#333",
    marginLeft: wp(1.5),
  },
  clearRecordingsButton: {
    backgroundColor: "#fff",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  clearRecordings: {
    fontSize: wp(3.5),
    color: "#ff6b6b",
    fontFamily: "Quicksand-Bold",
  },
  recordingsList: {
    gap: hp(1),
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
  recordingIconContainerActive: {
    backgroundColor: "#ff5252",
  },
});
