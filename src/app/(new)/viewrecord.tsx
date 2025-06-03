import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { wp, hp } from "@/components/newemoji/utils";
import { format } from "date-fns";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";

// Import các component đã tách
import DateTimeHeader from "@/components/carddetail/DateTimeHeader";
import EmojiDisplay from "@/components/carddetail/EmojiDisplay";
import NoteCard from "@/components/carddetail/NoteCard";
import ImagesGrid from "@/components/carddetail/ImagesGrid";
import RecordingsList from "@/components/carddetail/RecordingsList";
import { ACTIVITIES } from "@/utils/constant";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Định nghĩa kiểu dữ liệu cho file
interface FileData {
  id: number;
  fname: string;
  type: string;
  url: string;
  fkey: string;
  size: string;
  record_id: number;
  user_id: number;
  created_time: string;
  updated_time: string;
  duration?: string;
}

// Định nghĩa kiểu dữ liệu cho activity
interface ActivityData {
  activity_id: number;
  record_id: number;
  created_time: string;
}

// Định nghĩa kiểu dữ liệu cho bản ghi âm
interface RecordingData {
  id: number;
  uri: string;
  duration: string;
  sound?: Audio.Sound;
  isPlaying?: boolean;
  isPaused?: boolean;
  fileExists: boolean;
  isMusic?: boolean;
  name?: string;
  currentPosition?: string;
  durationMillis?: number;
  currentMillis?: number;
}

// Định nghĩa kiểu dữ liệu cho record
interface RecordData {
  id: number;
  title: string;
  content: string;
  status: string;
  created_time: string;
  updated_time: string;
  date: string;
  mood_id: number;
  user_id: number;
  activities: ActivityData[];
  files: FileData[];
}

// Hiển thị danh sách activities đã chọn
const ActivitiesList = ({ activities }: { activities: number[] }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <View style={styles.activitiesContainer}>
      <View style={styles.activitiesHeader}>
        <FontAwesome5 name="layer-group" size={wp(4.5)} color="#16A34A" />
        <Text style={styles.activitiesTitle}>Activities</Text>
      </View>
      <View style={styles.activitiesList}>
        {activities.map((activityId) => {
          const activity = ACTIVITIES.find((a) => a.id === activityId);
          if (!activity) return null;

          return (
            <View key={activityId} style={styles.activityItem}>
              <FontAwesome5 name={activity.icon} size={wp(4)} color="#16A34A" />
              <Text style={styles.activityName}>{activity.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

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

// Thêm ImageViewer component để hiển thị ảnh phóng to
const ImageViewer = ({
  visible,
  imageUrl,
  onClose,
}: {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}) => {
  if (!visible) return null;

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableOpacity
        style={styles.imageViewerContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.fullSizeImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Modal>
  );
};

// Cập nhật ImagesGrid để hỗ trợ phóng to ảnh
const EnhancedImagesGrid = ({ images }: { images: string[] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.imageContainer}>
      <View style={styles.imageGrid}>
        {images.map((imageUrl, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageWrapper}
            onPress={() => handleImagePress(imageUrl)}
          >
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </TouchableOpacity>
        ))}
      </View>
      <ImageViewer
        visible={!!selectedImage}
        imageUrl={selectedImage || ""}
        onClose={handleCloseViewer}
      />
    </View>
  );
};

export default function ViewRecordScreen() {
  const params = useLocalSearchParams();
  const recordId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false); // Add this flag
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<RecordData | null>(null);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [activityIds, setActivityIds] = useState<number[]>([]);

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("User data loaded:", parsedUser);
        } else {
          throw new Error("User information not found in AsyncStorage");
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Please log in again to continue");
        showAlert(
          "error",
          "Authentication Error",
          "Please log in again to continue",
          [{ text: "OK", onPress: () => router.push("/(auth)/login" as any) }]
        );
      } finally {
        setUserLoaded(true); // Mark user loading as complete
      }
    };

    loadUser();
  }, []);

  // Tải dữ liệu record từ API
  useEffect(() => {
    if (!userLoaded) {
      console.log("User not loaded yet, waiting...");
      return;
    }

    if (!user || !user.id) {
      console.log("No user data available after loading");
      setError("Please log in again to continue");
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_ENDPOINTS.RECORDS}/${recordId}?user_id=${user.id}`
        );

        if (!response.ok) {
          throw new Error(`Không thể tải dữ liệu. Mã lỗi: ${response.status}`);
        }

        const result = await response.json();
        console.log("Dữ liệu record:", result);

        if (result.statusCode === 200 && result.data) {
          setRecordData(result.data);

          // Xử lý activities
          const actIds = result.data.activities.map(
            (act: ActivityData) => act.activity_id
          );
          setActivityIds(actIds);

          // Xử lý files
          const imageFiles = result.data.files.filter((file: FileData) =>
            file.type.startsWith("image/")
          );
          setImages(imageFiles.map((file: FileData) => file.url));

          // Xử lý recordings
          const audioFiles = result.data.files.filter((file: FileData) =>
            file.type.startsWith("audio/")
          );

          if (audioFiles.length > 0) {
            const recordingsData = await Promise.all(
              audioFiles.map(async (file: FileData, index: number) => {
                try {
                  // Kiểm tra và tải âm thanh
                  const { sound } = await Audio.Sound.createAsync(
                    { uri: file.url },
                    { shouldPlay: false }
                  );

                  return {
                    id: index + 1,
                    uri: file.url,
                    duration: file.duration || "00:00",
                    sound,
                    isPlaying: false,
                    isPaused: false,
                    fileExists: true,
                    name: file.fname,
                    isMusic: file.type === "audio/mpeg",
                    currentPosition: "00:00",
                    durationMillis: file.duration
                      ? parseInt(file.duration.split(":")[0]) * 60 * 1000 +
                        parseInt(file.duration.split(":")[1]) * 1000
                      : 0,
                    currentMillis: 0,
                  };
                } catch (error) {
                  console.error(`Lỗi khi tải audio file ${file.fname}:`, error);
                  return {
                    id: index + 1,
                    uri: file.url,
                    duration: file.duration || "00:00",
                    fileExists: false,
                    name: file.fname,
                    isMusic: file.type === "audio/mpeg",
                    currentPosition: "00:00",
                    durationMillis: file.duration
                      ? parseInt(file.duration.split(":")[0]) * 60 * 1000 +
                        parseInt(file.duration.split(":")[1]) * 1000
                      : 0,
                    currentMillis: 0,
                  };
                }
              })
            );

            setRecordings(recordingsData);
          }
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (error: any) {
        console.error("Lỗi khi tải dữ liệu record:", error);
        setError(`Lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    } else {
      setError("Không có ID record");
      setLoading(false);
    }

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
  }, [recordId, user]);

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

      // Tìm đối tượng sound từ recordings
      const currentRecording = recordings.find(
        (rec) => rec.id === recording.id
      );

      if (!currentRecording) {
        console.log("Không tìm thấy bản ghi");
        showAlert("error", "Error", "Unable to play audio");
        return;
      }

      // Dừng bản ghi đang phát (nếu có)
      if (currentSound && currentSound !== currentRecording.sound) {
        console.log("Dừng âm thanh hiện tại");
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }

      // Nếu sound chưa được tạo hoặc đã bị unload, tạo mới
      if (!currentRecording.sound) {
        console.log("Tạo mới đối tượng sound");
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: recording.uri },
            { shouldPlay: false }
          );

          // Cập nhật sound vào recordings
          setRecordings((prev) =>
            prev.map((rec) =>
              rec.id === recording.id ? { ...rec, sound } : rec
            )
          );

          // Sử dụng sound mới tạo
          const soundToPlay = sound;

          // Lấy trạng thái hiện tại để có thông tin về tổng thời lượng
          const status = await soundToPlay.getStatusAsync();
          const durationMillis = status.isLoaded
            ? status.durationMillis || 0
            : 0;

          // Đánh dấu tất cả các bản ghi là không đang phát, trừ bản ghi hiện tại
          setRecordings((prev) =>
            prev.map((rec) => ({
              ...rec,
              isPlaying: rec.id === recording.id,
              isPaused: false,
              durationMillis:
                rec.id === recording.id ? durationMillis : rec.durationMillis,
              currentMillis: rec.id === recording.id ? 0 : rec.currentMillis,
              currentPosition:
                rec.id === recording.id ? "00:00" : rec.currentPosition,
            }))
          );

          // Phát bản ghi đã chọn
          console.log("Đang phát âm thanh...");
          await soundToPlay.playAsync();
          setCurrentSound(soundToPlay);

          // Thiết lập các sự kiện cập nhật vị trí
          setupPlaybackEvents(soundToPlay, recording);
        } catch (err) {
          console.error("Không thể tạo đối tượng sound:", err);
          showAlert("error", "Error", "Unable to play audio");
          return;
        }
      } else {
        // Sử dụng sound hiện có
        const soundToPlay = currentRecording.sound;

        // Lấy trạng thái hiện tại để có thông tin về tổng thời lượng
        const status = await soundToPlay.getStatusAsync();
        const durationMillis = status.isLoaded ? status.durationMillis || 0 : 0;

        // Đánh dấu tất cả các bản ghi là không đang phát, trừ bản ghi hiện tại
        setRecordings((prev) =>
          prev.map((rec) => ({
            ...rec,
            isPlaying: rec.id === recording.id,
            isPaused: false,
            durationMillis:
              rec.id === recording.id ? durationMillis : rec.durationMillis,
            currentMillis: rec.id === recording.id ? 0 : rec.currentMillis,
            currentPosition:
              rec.id === recording.id ? "00:00" : rec.currentPosition,
          }))
        );

        // Phát bản ghi đã chọn
        console.log("Đang phát âm thanh...");
        await soundToPlay.setPositionAsync(0);
        await soundToPlay.playAsync();
        setCurrentSound(soundToPlay);

        // Thiết lập các sự kiện cập nhật vị trí
        setupPlaybackEvents(soundToPlay, recording);
      }
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
      showAlert("error", "Error", "Unable to play audio");
    }
  };

  // Hàm dừng tạm thời âm thanh
  const pauseRecording = async (recording: RecordingData) => {
    try {
      console.log("Tạm dừng âm thanh", recording.id);

      // Kiểm tra nếu đang có sound đang phát
      if (currentSound) {
        // Dừng âm thanh đang phát
        await currentSound.pauseAsync();

        // Cập nhật trạng thái isPlaying và isPaused
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recording.id
              ? { ...rec, isPlaying: false, isPaused: true }
              : rec
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạm dừng âm thanh:", error);
      showAlert("error", "Error", "Unable to pause audio");
    }
  };

  // Hàm dừng hoàn toàn âm thanh
  const stopRecording = async (recording: RecordingData) => {
    try {
      console.log("Dừng hoàn toàn âm thanh", recording.id);

      // Kiểm tra nếu đang có sound đang phát
      if (currentSound) {
        // Dừng âm thanh đang phát
        await currentSound.stopAsync();
        await currentSound.setPositionAsync(0);

        // Cập nhật trạng thái isPlaying và isPaused
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recording.id
              ? {
                  ...rec,
                  isPlaying: false,
                  isPaused: false,
                  currentPosition: "00:00",
                  currentMillis: 0,
                }
              : rec
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi dừng âm thanh:", error);
      showAlert("error", "Error", "Unable to stop audio");
    }
  };

  // Hàm tiếp tục phát âm thanh sau khi tạm dừng
  const resumeRecording = async (recording: RecordingData) => {
    try {
      console.log("Tiếp tục phát âm thanh", recording.id);

      // Tìm đối tượng sound từ recordings
      const currentRecording = recordings.find(
        (rec) => rec.id === recording.id
      );

      if (!currentRecording || !currentRecording.sound) {
        console.log("Không tìm thấy bản ghi hoặc sound không tồn tại");
        showAlert("error", "Error", "Unable to resume audio playback");
        return;
      }

      // Tiếp tục phát âm thanh từ vị trí đã dừng
      await currentRecording.sound.playAsync();
      setCurrentSound(currentRecording.sound);

      // Cập nhật trạng thái isPaused và isPlaying
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id
            ? { ...rec, isPlaying: true, isPaused: false }
            : rec
        )
      );
    } catch (error) {
      console.error("Lỗi khi tiếp tục phát âm thanh:", error);
      showAlert("error", "Error", "Unable to resume audio playback");
    }
  };

  // Hàm thiết lập sự kiện cập nhật trạng thái phát
  const setupPlaybackEvents = (
    sound: Audio.Sound,
    recording: RecordingData
  ) => {
    // Lắng nghe sự kiện cập nhật trạng thái
    sound.setOnPlaybackStatusUpdate((status) => {
      // Nếu đang phát, cập nhật vị trí hiện tại
      if (status.isLoaded && status.isPlaying) {
        const currentMillis = status.positionMillis;
        const formattedPosition = formatTime(currentMillis);

        // Cập nhật vị trí hiện tại trong recordings
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recording.id
              ? {
                  ...rec,
                  currentMillis: currentMillis,
                  currentPosition: formattedPosition,
                }
              : rec
          )
        );
      }

      // Khi phát xong
      if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
        console.log("Âm thanh đã phát xong");
        // Đặt lại trạng thái isPlaying
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recording.id
              ? {
                  ...rec,
                  isPlaying: false,
                  isPaused: false,
                  currentPosition: "00:00",
                  currentMillis: 0,
                }
              : rec
          )
        );
        setCurrentSound(null);
      }
    });
  };

  // Thêm hàm định dạng thời gian
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Xử lý quay về trang trước
  const handleGoBack = () => {
    router.back();
  };

  // Hiển thị loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi
  if (error || !recordData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome5
            name="exclamation-circle"
            size={wp(10)}
            color="#EF4444"
          />
          <Text style={styles.errorText}>{error || "No data found"}</Text>
          <Text style={styles.backLink} onPress={handleGoBack}>
            Go Back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Chuẩn bị dữ liệu để hiển thị
  const date = new Date(recordData.date);
  const dayName = format(date, "EEEE");
  const dayNumber = format(date, "d");
  const monthName = format(date, "MMMM");
  const formattedTime = format(date, "HH:mm");

  // Trích xuất tiêu đề và nội dung
  const { title: extractedTitle, content: noteContent } =
    extractTitleAndContent(recordData.content);
  const noteTitle = extractedTitle || recordData.title || "How I feel today";

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
            onSubmit={handleGoBack}
          />

          {/* Hiển thị emoji tương ứng với mood */}
          <EmojiDisplay moodId={recordData.mood_id} />

          {/* Hiển thị danh sách activities nếu có */}
          {activityIds.length > 0 && (
            <ActivitiesList activities={activityIds} />
          )}

          {/* Hiển thị ghi chú - đã tách title và content */}
          {recordData.content && (
            <NoteCard title={noteTitle} content={noteContent} />
          )}

          {/* Hiển thị hình ảnh nếu có */}
          {images.length > 0 && <EnhancedImagesGrid images={images} />}

          {/* Hiển thị danh sách bản ghi âm */}
          {recordings.length > 0 && (
            <RecordingsList
              recordings={recordings}
              onPlayRecording={playRecording}
              onPauseRecording={pauseRecording}
              onStopRecording={stopRecording}
              onResumeRecording={resumeRecording}
            />
          )}
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

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
  container: {
    flex: 1,
    backgroundColor: "#E0F7ED",
    paddingTop: hp(2),
  },
  content: {
    flex: 1,
    padding: wp(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    fontFamily: "Quicksand-Medium",
    color: "#16A34A",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  errorText: {
    marginTop: hp(2),
    fontSize: wp(4),
    fontFamily: "Quicksand-Medium",
    color: "#333",
    textAlign: "center",
  },
  backLink: {
    marginTop: hp(3),
    fontSize: wp(4),
    fontFamily: "Quicksand-Bold",
    color: "#16A34A",
    textDecorationLine: "underline",
  },
  // Styles cho phần activities
  activitiesContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: wp(4),
    padding: wp(4),
    marginVertical: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.1)",
  },
  activitiesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingBottom: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(34, 197, 94, 0.15)",
  },
  activitiesTitle: {
    fontSize: wp(4.2),
    fontFamily: "Quicksand-Bold",
    color: "#16A34A",
    marginLeft: wp(2.5),
    letterSpacing: 0.5,
  },
  activitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2.5),
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(10),
    gap: wp(2),
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  activityName: {
    fontSize: wp(3.5),
    fontFamily: "Quicksand-SemiBold",
    color: "#166534",
  },
  // Thêm styles mới cho phần hiển thị ảnh phóng to
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullSizeImage: {
    width: "100%",
    height: "80%",
  },

  // Thêm styles cho ImagesGrid (nếu không có sẵn)
  imageContainer: {
    marginVertical: hp(1.5),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: wp(4),
    padding: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.1)",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: wp(1.5),
  },
  imageWrapper: {
    width: "32%",
    aspectRatio: 1,
    marginBottom: wp(1),
    borderRadius: wp(2),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
