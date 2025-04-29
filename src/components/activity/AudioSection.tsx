import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { wp, hp } from "../newemoji/utils";

interface RecordingInfo {
  sound?: Audio.Sound;
  duration: string;
  file: string;
  isPlaying?: boolean;
}

interface AudioSectionProps {
  recordings: RecordingInfo[];
  setRecordings: React.Dispatch<React.SetStateAction<RecordingInfo[]>>;
}

const AudioSection: React.FC<AudioSectionProps> = ({
  recordings,
  setRecordings,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  // Cleanup khi component unmount
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

  return (
    <View style={styles.mediaSection}>
      <View style={styles.mediaTitleContainer}>
        <FontAwesome5 name="microphone" size={wp(5)} color="#333" />
        <Text style={styles.mediaTitle}>Audio</Text>
      </View>
      <View style={styles.mediaButtonsContainer}>
        <TouchableOpacity
          style={[styles.mediaButton, recording && styles.recordingActive]}
          onPress={recording ? stopRecording : startRecording}
        >
          <FontAwesome5
            name={recording ? "stop" : "wave-square"}
            size={wp(5)}
            color={recording ? "#FF0000" : "#333"}
          />
          <Text
            style={[styles.mediaButtonText, recording && styles.recordingText]}
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
  );
};

const styles = StyleSheet.create({
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

export default AudioSection;
