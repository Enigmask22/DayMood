import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { wp, hp } from "@/components/newemoji/utils";
import { format } from "date-fns";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values"; // Cần thiết cho uuid
import { uploadFileFromBase64, uploadAudioFromUri } from "@/utils/fileService";
import { ACTIVITIES } from "@/utils/constant";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  isPaused?: boolean;
  fileExists: boolean;
  isMusic?: boolean;
  name?: string;
  currentPosition?: string;
  durationMillis?: number;
  currentMillis?: number;
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
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [errorStates, setErrorStates] = useState<{ [key: number]: boolean }>({});

  if (!images || images.length === 0) return null;

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };

  // Handle image loading states
  const handleImageLoadStart = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: true }));
  };

  const getImageType = (uri: string) => {
    if (uri.startsWith("data:image")) return "Base64";
    if (uri.startsWith("file://")) return "Local";
    if (uri.startsWith("http")) return "Web";
    return "Unknown";
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
            <View style={styles.imageItemContainer}>
              {/* Loading indicator */}
              {loadingStates[index] && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="small" color="#32B768" />
                  <Text style={styles.loadingImageText}>Loading...</Text>
                </View>
              )}
              
              {/* Error overlay */}
              {errorStates[index] && (
                <View style={styles.imageErrorOverlay}>
                  <Text style={styles.errorImageText}>Failed to load</Text>
                  <Text style={styles.errorImageSubText}>{getImageType(imageUrl)}</Text>
                </View>
              )}
              
              <Image 
                source={{ uri: imageUrl }} 
                style={[
                  styles.image,
                  errorStates[index] && styles.errorImage
                ]} 
                onLoadStart={() => handleImageLoadStart(index)}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                resizeMode="cover"
              />
            </View>
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

export default function CardDetailScreen() {
  // Nhận các tham số từ navigation
  const params = useLocalSearchParams();
  const moodId = params.mood ? parseInt(params.mood as string) : 4; // Default to joyful
  const note = (params.note as string) || "";
  const dateParam = params.date as string;
  const [user, setUser] = useState<any>(null);

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
          console.log("User data loaded:", JSON.parse(userData));
        } else {
          throw new Error("User information not found in AsyncStorage");
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        Alert.alert("Error", "Please log in again to continue");
        router.push("/(auth)/login" as any);
      }
    };

    loadUser();
  }, []);

  // Xử lý dữ liệu bản ghi âm
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  // Xử lý dữ liệu hình ảnh
  const [images, setImages] = useState<string[]>([]);
  // Tải dữ liệu hình ảnh từ params
  useEffect(() => {
    try {
      //console.log("params.images:", params.images);
      if (
        params.images &&
        typeof params.images === "string" &&
        params.images !== ""
      ) {
        const parsedImages = JSON.parse(params.images);
        console.log("Ảnh đã parse:", parsedImages);

        // Xử lý mảng URI đơn giản
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

          console.log("Đường dẫn ảnh hợp lệ:", validImages);
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
                    durationMillis: status.isLoaded
                      ? status.durationMillis || 0
                      : 0,
                    currentMillis: status.isLoaded
                      ? status.positionMillis || 0
                      : 0,
                    currentPosition: status.isLoaded
                      ? formatTime(status.positionMillis || 0)
                      : "00:00",
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

      // Tìm đối tượng sound từ recordings
      const currentRecording = recordings.find(
        (rec) => rec.id === recording.id
      );

      if (!currentRecording) {
        console.log("Không tìm thấy bản ghi");
        Alert.alert("Lỗi", "Không thể phát âm thanh");
        return;
      }

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

          // Kiểm tra trạng thái âm thanh trước khi phát
          const status = await soundToPlay.getStatusAsync();
          console.log("Trạng thái âm thanh trước khi phát:", status);
          const durationMillis = status.isLoaded
            ? status.durationMillis || 0
            : 0;

          // Đánh dấu tất cả các bản ghi là không đang phát
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
          Alert.alert("Lỗi", "Không thể phát âm thanh");
          return;
        }
      } else {
        // Sử dụng sound hiện có
        const soundToPlay = currentRecording.sound;

        // Kiểm tra trạng thái âm thanh trước khi phát
        const status = await soundToPlay.getStatusAsync();
        console.log("Trạng thái âm thanh trước khi phát:", status);
        const durationMillis = status.isLoaded ? status.durationMillis || 0 : 0;

        // Đánh dấu tất cả các bản ghi là không đang phát
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
        await soundToPlay.setPositionAsync(0); // Đặt lại vị trí về đầu
        await soundToPlay.playAsync();
        setCurrentSound(soundToPlay);

        // Thiết lập các sự kiện cập nhật vị trí
        setupPlaybackEvents(soundToPlay, recording);
      }
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
      Alert.alert("Lỗi", "Không thể phát âm thanh");
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id
            ? { ...rec, isPlaying: false, isPaused: false }
            : rec
        )
      );
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
      Alert.alert("Lỗi", "Không thể tạm dừng âm thanh");
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
      Alert.alert("Lỗi", "Không thể dừng âm thanh");
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
        Alert.alert("Lỗi", "Không thể tiếp tục phát âm thanh");
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
      Alert.alert("Lỗi", "Không thể tiếp tục phát âm thanh");
    }
  };

  // Hàm thiết lập sự kiện cập nhật trạng thái phát
  const setupPlaybackEvents = (
    sound: Audio.Sound,
    recording: RecordingData
  ) => {
    // Lắng nghe sự kiện cập nhật trạng thái
    sound.setOnPlaybackStatusUpdate((status) => {
      console.log("Cập nhật trạng thái phát:", status);

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
      if (!user || !user.id) {
        Alert.alert("Error", "User information not found. Please log in again.");
        router.push("/(auth)/login" as any);
        return;
      }
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
        user_id: user.id, // Sử dụng user ID từ AsyncStorage
        activity_id: activities,
        status: "ACTIVE",
        date: date.toISOString(),
      };

      console.log("Bắt đầu tạo record:", recordData);

      // Tạo record với activities đã đính kèm
      const recordResponse = await fetch(API_ENDPOINTS.RECORDS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData),
      });

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
      console.log("Đã tạo record với ID:", recordResult);
      const recordId = recordResult.data.id;
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
              `user_${user.id}` 
            );

            console.log("File đã upload:", fileInfo);

            // Lưu thông tin file vào database
            await fetch(`${API_ENDPOINTS.FILES}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fname: fileInfo.fileName,
                type: fileInfo.fileType,
                url: fileInfo.url,
                fkey: fileInfo.key,
                size: fileInfo.size,
                record_id: recordId,
                user_id: user.id,
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
              `user_${user.id}` 
            );

            // Lưu thông tin file vào database
            await fetch(`${API_ENDPOINTS.FILES}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fname: recording.name || `Recording ${recording.id}`,
                type: recording.isMusic ? "audio/mpeg" : "audio/m4a",
                url: fileInfo.url,
                fkey: fileInfo.key,
                size: fileInfo.size,
                record_id: recordId,
                user_id: user.id,
                duration: recording.duration || "00:00",
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
          {/* Hiển thị ngày và thời gian - cập nhật tên prop từ onBack sang onSubmit */}
          <DateTimeHeader
            dayName={dayName}
            dayNumber={dayNumber}
            monthName={monthName}
            formattedTime={formattedTime}
            onSubmit={handleBackToHome}
            onEdit={handleEdit}
          />

          {/* Hiển thị emoji tương ứng với mood */}
          <EmojiDisplay moodId={moodId} />

          {/* Hiển thị danh sách activities nếu có */}
          {activities.length > 0 && <ActivitiesList activities={activities} />}

          {/* Hiển thị ghi chú - đã tách title và content trước khi truyền vào NoteCard */}
          {note && <NoteCard title={noteTitle} content={noteContent} />}

          {/* Hiển thị hình ảnh nếu có - Thay ImagesGrid bằng EnhancedImagesGrid */}
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
    paddingTop: hp(2),
  },
  content: {
    flex: 1,
    padding: wp(5),
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
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "32%",
    aspectRatio: 1,
    marginBottom: wp(1),
    borderRadius: wp(2),
    overflow: "hidden",
  },  image: {
    width: "100%",
    height: "100%",
  },

  // Enhanced image grid styles
  imageItemContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingImageText: {
    marginTop: 8,
    fontSize: wp(3),
    color: '#666',
    fontFamily: 'Quicksand-Medium',
  },
  imageErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  errorImageText: {
    fontSize: wp(3),
    color: '#ff4444',
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
  },
  errorImageSubText: {
    fontSize: wp(2.5),
    color: '#ff6666',
    fontFamily: 'Quicksand-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  errorImage: {
    opacity: 0.3,
  },
});