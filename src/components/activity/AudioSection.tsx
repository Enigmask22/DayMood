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
import * as DocumentPicker from "expo-document-picker";
import { wp, hp } from "../newemoji/utils";

interface RecordingInfo {
  sound?: Audio.Sound;
  duration: string;
  file: string;
  isPlaying?: boolean;
  isMusic?: boolean;
  name?: string;
  currentPosition?: string; // Vị trí phát hiện tại (định dạng mm:ss)
  durationMillis?: number; // Tổng thời lượng tính bằng milliseconds
  currentMillis?: number; // Vị trí hiện tại tính bằng milliseconds
}

interface AudioSectionProps {
  recordings: RecordingInfo[];
  setRecordings: React.Dispatch<React.SetStateAction<RecordingInfo[]>>;
  onClearAll?: () => Promise<void>;
}

const AudioSection: React.FC<AudioSectionProps> = ({
  recordings,
  setRecordings,
  onClearAll,
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
      setRecording(undefined);
      await recording.stopAndUnloadAsync();

      // Thay đổi cấu hình Audio để phát
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recording.getURI();
      console.log("URI bản ghi âm vừa tạo:", uri);

      if (!uri) {
        Alert.alert("Lỗi", "Không thể lưu bản ghi âm");
        return;
      }

      // Tạo thư mục audio nếu chưa tồn tại
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(audioDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      }

      // Di chuyển tệp tạm thời vào thư mục cố định
      const fileName = `recording-${Date.now()}.m4a`;
      const permanentUri = `${audioDir}${fileName}`;

      // Kiểm tra xem file có tồn tại không trước khi copy
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("File tạm thời không tồn tại");
      }

      await FileSystem.copyAsync({
        from: uri,
        to: permanentUri,
      });

      console.log("Đã lưu bản ghi âm tại:", permanentUri);

      // Lấy thời lượng của bản ghi
      const durationMillis = await getDurationMillis(permanentUri);
      const formattedDuration = getDurationFormatted(durationMillis || 0);

      // Thêm bản ghi mới vào danh sách
      const newRecordings = [
        ...recordings,
        {
          duration: formattedDuration,
          file: permanentUri,
          isPlaying: false,
        },
      ];

      setRecordings(newRecordings);
      console.log("Đã thêm bản ghi âm với URI:", permanentUri);

      // Kiểm tra quyền truy cập tệp sau khi lưu
      const permAccessInfo = await FileSystem.getInfoAsync(permanentUri);
      console.log("Kiểm tra tệp đã lưu:", permAccessInfo);
    } catch (error) {
      console.error("Lỗi khi lưu tệp ghi âm:", error);
      Alert.alert("Lỗi", "Không thể lưu bản ghi âm");
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

  // Hàm mới để chọn file nhạc từ thiết bị
  async function selectMusicFile() {
    try {
      // Thiết lập Audio Mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Chọn file âm thanh từ thiết bị
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "audio/mpeg", "audio/mp3", "audio/m4a", "audio/wav"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Đã hủy chọn file");
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || `music-${Date.now()}`;
      console.log("File nhạc được chọn:", fileName);
      console.log("URI file nhạc:", fileUri);

      // Kiểm tra xem file có tồn tại không
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File không tồn tại");
      }

      // Tạo thư mục audio nếu chưa tồn tại
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(audioDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      }

      // Lưu file vào thư mục cố định
      const permanentFileName = `music-${Date.now()}-${fileName.replace(
        /\s+/g,
        "_"
      )}`;
      const permanentUri = `${audioDir}${permanentFileName}`;

      await FileSystem.copyAsync({
        from: fileUri,
        to: permanentUri,
      });

      console.log("URI file nhạc (cố định):", permanentUri);

      // Kiểm tra file sau khi lưu
      const savedFileInfo = await FileSystem.getInfoAsync(permanentUri);
      console.log("Thông tin file đã lưu:", savedFileInfo);

      // Lấy thời lượng của file âm thanh
      const durationMillis = await getDurationMillis(permanentUri);
      const formattedDuration = getDurationFormatted(durationMillis || 0);

      // Thêm file nhạc vào danh sách recordings
      const newRecordings = [
        ...recordings,
        {
          duration: formattedDuration,
          file: permanentUri,
          isPlaying: false,
          isMusic: true,
          name: fileName,
        },
      ];

      setRecordings(newRecordings);
      console.log("Đã thêm file nhạc với thông tin:", {
        uri: permanentUri,
        duration: formattedDuration,
        name: fileName,
      });

      Alert.alert("Thành công", `Đã thêm file nhạc: ${fileName}`);
    } catch (error) {
      console.error("Lỗi khi chọn file nhạc:", error);
      Alert.alert("Lỗi", "Không thể thêm file nhạc");
    }
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

      // Lấy tổng thời lượng
      const durationMillis = status.durationMillis || 0;

      // Cập nhật trạng thái isPlaying
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec, idx) => ({
          ...rec,
          isPlaying: idx === index,
          // Thêm thông tin thời gian
          durationMillis: idx === index ? durationMillis : rec.durationMillis,
          currentMillis: idx === index ? 0 : rec.currentMillis,
          currentPosition: idx === index ? "00:00" : rec.currentPosition,
        }))
      );

      // Phát âm thanh
      console.log("Đang phát âm thanh...");
      await newSound.playAsync();
      setCurrentSound(newSound);

      // Cài đặt callback khi âm thanh kết thúc
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        console.log("Cập nhật trạng thái phát:", status);

        // Nếu đang phát, cập nhật vị trí hiện tại
        if (status.isLoaded && status.isPlaying) {
          const currentMillis = status.positionMillis;
          const formattedPosition = formatTime(currentMillis);

          // Cập nhật vị trí hiện tại trong recordings
          setRecordings((prevRecordings) =>
            prevRecordings.map((rec, idx) =>
              idx === index
                ? {
                    ...rec,
                    currentMillis: currentMillis,
                    currentPosition: formattedPosition,
                  }
                : rec
            )
          );
        }

        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          console.log("Âm thanh đã phát xong");
          // Đặt lại trạng thái khi phát xong
          setRecordings((prevRecordings) =>
            prevRecordings.map((rec) => ({
              ...rec,
              isPlaying: false,
              currentPosition: "00:00",
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

    // Nếu có callback onClearAll, sử dụng nó, nếu không thì xóa recordings trực tiếp
    if (onClearAll) {
      onClearAll();
    } else {
      setRecordings([]);
    }
  }

  // Thêm hàm định dạng thời gian ngay sau các hàm khác
  function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      const isPlaying = recordingLine.isPlaying || false;
      const isMusic = recordingLine.isMusic || false;

      // Xử lý tên file nhạc quá dài
      let itemTitle = "";
      if (isMusic) {
        const originalName = recordingLine.name || `Nhạc #${index + 1}`;
        // Giới hạn tên file nhạc tối đa 25 ký tự
        itemTitle =
          originalName.length > 25
            ? originalName.substring(0, 22) + "..."
            : originalName;
      } else {
        itemTitle = `Bản ghi #${index + 1}`;
      }

      return (
        <View key={index} style={styles.recordingItem}>
          <View style={styles.recordingInfo}>
            <View
              style={[
                styles.recordingIconContainer,
                isPlaying && styles.recordingIconContainerActive,
                isMusic && styles.musicIconContainer,
                isMusic && isPlaying && styles.musicIconContainerActive,
              ]}
            >
              <FontAwesome5
                name={
                  isMusic ? "music" : isPlaying ? "volume-up" : "microphone"
                }
                size={wp(4)}
                color={isPlaying ? "#fff" : isMusic ? "#6366F1" : "#32B768"}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text
                style={styles.recordingTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {itemTitle}
              </Text>
              <Text
                style={
                  isPlaying ? styles.playingDuration : styles.recordingDuration
                }
              >
                {isPlaying && recordingLine.currentPosition
                  ? `${recordingLine.currentPosition}/${recordingLine.duration}`
                  : recordingLine.duration}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() =>
              isPlaying ? stopPlayback(index) : playRecording(index)
            }
          >
            <LinearGradient
              colors={
                isPlaying
                  ? ["#ff6b6b", "#ff5252"]
                  : isMusic
                  ? ["#6366F1", "#4F46E5"]
                  : ["#32B768", "#27A35A"]
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
                {isPlaying ? "STOP" : "PLAY"}
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
        <TouchableOpacity style={styles.mediaButton} onPress={selectMusicFile}>
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
    marginRight: wp(2),
    overflow: "hidden",
  },
  recordingIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "rgba(50, 183, 104, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2.5),
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  recordingTitle: {
    fontSize: wp(3.5),
    color: "#333",
    fontFamily: "Quicksand-Bold",
    marginBottom: hp(0.3),
  },
  recordingDuration: {
    fontSize: wp(3.2),
    color: "#666",
    fontFamily: "Quicksand-Regular",
  },
  playingDuration: {
    fontSize: wp(3.2),
    color: "#32B768",
    fontFamily: "Quicksand-Medium",
  },
  playButton: {
    borderRadius: wp(5),
    overflow: "hidden",
    flexShrink: 0,
    minWidth: wp(20),
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
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
  musicIconContainer: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  musicIconContainerActive: {
    backgroundColor: "#6366F1",
  },
});

export default AudioSection;
