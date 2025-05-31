import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { wp, hp } from "../newemoji/utils";

// Custom Alert Component
interface CustomAlertProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }>;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onClose,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "check-circle", color: "#10B981", bgColor: "#ECFDF5" };
      case "error":
        return {
          icon: "exclamation-circle",
          color: "#EF4444",
          bgColor: "#FEF2F2",
        };
      case "warning":
        return {
          icon: "exclamation-triangle",
          color: "#F59E0B",
          bgColor: "#FFFBEB",
        };
      case "info":
        return { icon: "info-circle", color: "#3B82F6", bgColor: "#EFF6FF" };
      default:
        return { icon: "info-circle", color: "#6B7280", bgColor: "#F9FAFB" };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[customAlertStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            customAlertStyles.alertContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[
              customAlertStyles.iconContainer,
              { backgroundColor: bgColor },
            ]}
          >
            <FontAwesome5 name={icon} size={wp(6)} color={color} />
          </View>

          <Text style={customAlertStyles.title}>{title}</Text>
          <Text style={customAlertStyles.message}>{message}</Text>

          <View style={customAlertStyles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  customAlertStyles.button,
                  button.style === "cancel" && customAlertStyles.cancelButton,
                  button.style === "destructive" &&
                    customAlertStyles.destructiveButton,
                  buttons.length === 1 && customAlertStyles.singleButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text
                  style={[
                    customAlertStyles.buttonText,
                    button.style === "cancel" &&
                      customAlertStyles.cancelButtonText,
                    button.style === "destructive" &&
                      customAlertStyles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

interface RecordingInfo {
  sound?: Audio.Sound;
  duration: string;
  file: string;
  isPlaying?: boolean;
  isPaused?: boolean;
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

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [{ text: "OK", style: "default" }],
  });

  // Helper function to show custom alert
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

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
          showAlert(
            "error",
            "Notification",
            "Need microphone access to record"
          );
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
      showAlert("error", "Error", "Cannot start recording");
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
        showAlert("error", "Error", "Cannot save recording");
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
        throw new Error("Temporary file does not exist");
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
          isPaused: false,
          name: `Recording ${recordings.length + 1}`,
        },
      ];

      setRecordings(newRecordings);
      console.log("Đã thêm bản ghi âm với URI:", permanentUri);

      // Kiểm tra quyền truy cập tệp sau khi lưu
      const permAccessInfo = await FileSystem.getInfoAsync(permanentUri);
      console.log("Kiểm tra tệp đã lưu:", permAccessInfo);
    } catch (error) {
      console.error("Lỗi khi lưu tệp ghi âm:", error);
      showAlert("error", "Error", "Cannot save recording");
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
        throw new Error("File does not exist");
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
          isPaused: false,
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

      showAlert("success", "Success", `Added music: ${fileName}`);
    } catch (error) {
      console.error("Lỗi khi chọn file nhạc:", error);
      showAlert("error", "Error", "Cannot add music");
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
        showAlert("error", "Error", "Cannot load sound");
        return;
      }

      // Lấy tổng thời lượng
      const durationMillis = status.durationMillis || 0;

      // Cập nhật trạng thái isPlaying
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec, idx) => ({
          ...rec,
          isPlaying: idx === index,
          isPaused: false,
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

      // Thiết lập sự kiện cập nhật trạng thái phát
      setupPlaybackEvents(newSound, index);
    } catch (error) {
      console.error("Lỗi khi phát âm thanh", error);
      showAlert("error", "Error", "Cannot play recording");

      // Đặt lại trạng thái khi có lỗi
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec) => ({
          ...rec,
          isPlaying: false,
          isPaused: false,
        }))
      );
      setCurrentSound(null);
    }
  }

  // Hàm tạm dừng phát âm thanh (Pause)
  async function pauseRecording(index: number) {
    try {
      console.log("Tạm dừng âm thanh", index);
      if (currentSound) {
        await currentSound.pauseAsync();
        // Cập nhật trạng thái
        setRecordings((prevRecordings) =>
          prevRecordings.map((rec, idx) => ({
            ...rec,
            isPlaying: false,
            isPaused: idx === index,
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạm dừng âm thanh", error);
      showAlert("error", "Error", "Cannot pause recording");
    }
  }

  // Hàm tiếp tục phát âm thanh (Resume)
  async function resumeRecording(index: number) {
    try {
      console.log("Tiếp tục phát âm thanh", index);
      if (currentSound) {
        await currentSound.playAsync();
        // Cập nhật trạng thái
        setRecordings((prevRecordings) =>
          prevRecordings.map((rec, idx) => ({
            ...rec,
            isPlaying: idx === index,
            isPaused: false,
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi khi tiếp tục phát âm thanh", error);
      showAlert("error", "Error", "Cannot resume recording");
    }
  }

  // Hàm dừng hoàn toàn âm thanh (Stop)
  async function stopPlayback(index: number) {
    try {
      console.log("Dừng hoàn toàn âm thanh", index);
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.setPositionAsync(0);
        // Cập nhật trạng thái
        setRecordings((prevRecordings) =>
          prevRecordings.map((rec, idx) => ({
            ...rec,
            isPlaying: false,
            isPaused: false,
            currentPosition: "00:00",
            currentMillis: 0,
          }))
        );
        setCurrentSound(null);
      }
    } catch (error) {
      console.error("Lỗi khi dừng phát âm thanh", error);
      showAlert("error", "Error", "Cannot stop playback");
    }
  }

  // Hàm thiết lập sự kiện cập nhật trạng thái phát
  function setupPlaybackEvents(sound: Audio.Sound, index: number) {
    sound.setOnPlaybackStatusUpdate((status) => {
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
            isPaused: false,
            currentPosition: "00:00",
            currentMillis: 0,
          }))
        );
        sound
          .unloadAsync()
          .catch((err) => console.error("Lỗi khi unload sound:", err));
        setCurrentSound(null);
      }
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
      const isPaused = recordingLine.isPaused || false;
      const isMusic = recordingLine.isMusic || false;

      // Xử lý tên file nhạc quá dài
      let itemTitle = "";
      if (isMusic) {
        const originalName = recordingLine.name || `Music #${index + 1}`;
        // Giới hạn tên file nhạc tối đa 25 ký tự
        itemTitle =
          originalName.length > 25
            ? originalName.substring(0, 22) + "..."
            : originalName;
      } else {
        itemTitle = recordingLine.name || `Recording #${index + 1}`;
      }

      return (
        <View key={index} style={styles.recordingItem}>
          <View style={styles.recordingInfo}>
            <View
              style={[
                styles.recordingIconContainer,
                isPlaying && styles.recordingIconContainerActive,
                isPaused && styles.recordingIconContainerPaused,
                isMusic && styles.musicIconContainer,
                isMusic && isPlaying && styles.musicIconContainerActive,
                isMusic && isPaused && styles.musicIconContainerPaused,
              ]}
            >
              <FontAwesome5
                name={
                  isPlaying
                    ? "volume-up"
                    : isPaused
                    ? "volume-down"
                    : isMusic
                    ? "music"
                    : "microphone"
                }
                size={wp(4)}
                color={
                  isPlaying
                    ? "#fff"
                    : isPaused
                    ? "#ffa726"
                    : isMusic
                    ? "#6366F1"
                    : "#32B768"
                }
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
                  isPlaying || isPaused
                    ? styles.playingDuration
                    : styles.recordingDuration
                }
              >
                {(isPlaying || isPaused) && recordingLine.currentPosition
                  ? `${recordingLine.currentPosition}/${recordingLine.duration}`
                  : recordingLine.duration}
              </Text>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            {isPlaying && (
              <>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => pauseRecording(index)}
                >
                  <LinearGradient
                    colors={["#ffa726", "#fb8c00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <FontAwesome5 name="pause" size={wp(3.5)} color="#fff" />
                    <Text style={styles.buttonText}>PAUSE</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => stopPlayback(index)}
                >
                  <LinearGradient
                    colors={["#ff6b6b", "#ff5252"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <FontAwesome5 name="stop" size={wp(3.5)} color="#fff" />
                    <Text style={styles.buttonText}>STOP</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {isPaused && (
              <>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => resumeRecording(index)}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <FontAwesome5 name="play" size={wp(3.5)} color="#fff" />
                    <Text style={styles.buttonText}>RESUME</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => stopPlayback(index)}
                >
                  <LinearGradient
                    colors={["#ff6b6b", "#ff5252"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <FontAwesome5 name="stop" size={wp(3.5)} color="#fff" />
                    <Text style={styles.buttonText}>STOP</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {!isPlaying && !isPaused && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playRecording(index)}
              >
                <LinearGradient
                  colors={
                    isMusic ? ["#6366F1", "#4F46E5"] : ["#32B768", "#27A35A"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButtonGradient}
                >
                  <FontAwesome5 name="play" size={wp(3.5)} color="#fff" />
                  <Text style={styles.playButtonText}>PLAY</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
};

const customAlertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  alertContainer: {
    backgroundColor: "white",
    borderRadius: wp(4),
    padding: wp(6),
    width: "100%",
    maxWidth: wp(80),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(5),
    fontFamily: "Quicksand-Bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: hp(1),
  },
  message: {
    fontSize: wp(3.8),
    fontFamily: "Quicksand-Medium",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: wp(5.5),
    marginBottom: hp(3),
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: wp(3),
  },
  button: {
    flex: 1,
    backgroundColor: "#32B768",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  destructiveButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    fontSize: wp(4),
    fontFamily: "Quicksand-SemiBold",
    color: "white",
  },
  cancelButtonText: {
    color: "#6B7280",
  },
  destructiveButtonText: {
    color: "white",
  },
});

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
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    flexShrink: 0,
  },
  playButton: {
    borderRadius: wp(5),
    overflow: "hidden",
    flexShrink: 0,
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
  recordingIconContainerPaused: {
    backgroundColor: "#ffa726",
  },
  musicIconContainer: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  musicIconContainerActive: {
    backgroundColor: "#6366F1",
  },
  musicIconContainerPaused: {
    backgroundColor: "#7e57c2",
  },
  controlButton: {
    borderRadius: wp(5),
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(5),
  },
  buttonText: {
    fontSize: wp(3),
    color: "#fff",
    fontWeight: "bold",
    marginLeft: wp(1),
    fontFamily: "Quicksand-Bold",
    letterSpacing: 0.5,
  },
});

export default AudioSection;
