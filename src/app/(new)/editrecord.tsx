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
  TouchableOpacity,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Header from "@/components/newemoji/Header";
import DateTimeSelector from "@/components/newemoji/DateTimeSelector";
import { wp, hp } from "@/components/newemoji/utils";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { uploadFileFromBase64, uploadAudioFromUri } from "@/utils/fileService";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// Import thêm MoodSelector từ newemoj
import MoodSelector from "@/components/newemoji/MoodSelector";
// Các component
import DeleteButton from "@/components/activity/DeleteButton";
import BackHeaderWithEmoji from "@/components/activity/BackHeaderWithEmoji";
import ActivitiesSelector from "@/components/activity/ActivitiesSelector";
import NoteSection from "@/components/activity/NoteSection";
import ImageSection from "@/components/activity/ImageSection";
import AudioSection from "@/components/activity/AudioSection";
import SaveButton from "@/components/activity/SaveButton";

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

export default function EditRecordScreen() {
  // Lấy tham số từ URL
  const params = useLocalSearchParams();
  const { id } = params;
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

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

  // State cho dữ liệu record
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<any>(null);

  // States cho dữ liệu chỉnh sửa
  const [date, setDate] = useState<Date>(new Date());
  const [moodId, setMoodId] = useState<number | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [isFullNoteOpen, setIsFullNoteOpen] = useState(false);
  const [images, setImages] = useState<{ url: string; id: number }[]>([]);
  const [recordings, setRecordings] = useState<
    {
      sound?: Audio.Sound;
      duration: string;
      file: string;
      isPlaying?: boolean;
      isPaused?: boolean;
      isMusic?: boolean;
      name?: string;
      id?: number;
      currentPosition?: string;
      durationMillis?: number;
      currentMillis?: number;
    }[]
  >([]);

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

  // Fetch dữ liệu record
  useEffect(() => {
    if (!userLoaded) {
      console.log("User not loaded yet, waiting...");
      return;
    }

    if (id) {
      fetchRecordData();
    }
  }, [id, user]);

  const fetchRecordData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sử dụng fetch API với API_ENDPOINTS
      const response = await fetch(
        `${API_ENDPOINTS.RECORDS}/${id}?user_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu. Mã lỗi: ${response.status}`);
      }

      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        const data = result.data;
        setRecordData(data);

        // Cập nhật states với dữ liệu từ API
        setDate(new Date(data.date));
        setMoodId(data.mood_id);

        // Cập nhật activities
        if (data.activities && Array.isArray(data.activities)) {
          setSelectedActivities(
            data.activities.map((activity: any) => activity.activity_id)
          );
        }

        // Cập nhật note với cả title và content
        if (data.title || data.content) {
          setNote(`${data.title || ""}\n${data.content || ""}`);
        }

        // Cập nhật images - lưu thêm file_id
        if (data.files && Array.isArray(data.files)) {
          const imageFiles = data.files.filter((file: any) =>
            file.type.startsWith("image/")
          );
          const imageData = imageFiles.map((img: any) => ({
            url: img.url,
            id: img.id,
          }));
          setImages(imageData);
        }

        // Cập nhật recordings - lưu thêm file_id
        if (data.files && Array.isArray(data.files)) {
          const audioFiles = data.files.filter((file: any) =>
            file.type.startsWith("audio/")
          );

          const recordingData = audioFiles.map((rec: any) => ({
            file: rec.url,
            duration: rec.duration || "00:00",
            isMusic: rec.type === "audio/mpeg",
            name: rec.fname || `Bản ghi`,
            id: rec.id,
          }));
          setRecordings(recordingData);
        }
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu record:", err.message);
      setError("Không thể tải dữ liệu record. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi chọn mood
  const handleSelectMood = (id: number) => {
    setMoodId(id);
  };

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

  // Xử lý mở/đóng trình soạn thảo ghi chú đầy đủ
  const handleToggleFullNote = () => {
    setIsFullNoteOpen(!isFullNoteOpen);
  };

  // Xử lý thay đổi ghi chú
  const handleChangeNote = (text: string) => {
    setNote(text);
  };

  // Xử lý chụp ảnh mới
  const handleTakePhoto = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (!result.canceled) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // Thêm với id = 0 để đánh dấu là ảnh mới, chưa có id trong database
        setImages([...images, { url: base64Uri, id: 0 }]);
        console.log("Đã thêm ảnh base64");
      }
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
    }
  };

  // Xử lý chọn ảnh từ thư viện
  const handlePickFromGallery = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (!result.canceled) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // Thêm với id = 0 để đánh dấu là ảnh mới, chưa có id trong database
        setImages([...images, { url: base64Uri, id: 0 }]);
        console.log("Đã thêm ảnh base64 từ thư viện");
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
    }
  };

  // Xử lý xóa ảnh - cập nhật để gọi API xóa file
  const handleDeleteImage = async (index: number) => {
    try {
      const fileToDelete = images[index];
      if (fileToDelete && fileToDelete.id) {
        // Gọi API xóa file với API_ENDPOINTS
        const response = await fetch(
          `${API_ENDPOINTS.FILES}/${fileToDelete.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`Không thể xóa file. Mã lỗi: ${response.status}`);
        }

        // Nếu xóa thành công, cập nhật state
        setImages(images.filter((_, i) => i !== index));
        console.log(`Đã xóa file ảnh có ID: ${fileToDelete.id}`);
      } else {
        // Nếu không có file_id (ảnh mới thêm vào), chỉ cần xóa khỏi state
        setImages(images.filter((_, i) => i !== index));
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa file:", error.message);
      showAlert(
        "error",
        "Error",
        "Unable to delete file. Please try again later."
      );
    }
  };

  // Thêm hàm xử lý xóa tất cả bản ghi âm
  const handleClearAllRecordings = async () => {
    try {
      // Xác nhận trước khi xóa
      showAlert(
        "warning",
        "Confirm Delete",
        "Are you sure you want to delete all audio recordings?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // Lọc ra các file âm thanh cần xóa (có file_id)
              const recordingsToDelete = recordings.filter((rec) => rec.id);

              if (recordingsToDelete.length === 0) {
                // Không có bản ghi nào cần xóa
                setRecordings([]);
                return;
              }

              // Xóa từng file một
              let hasError = false;
              for (const recording of recordingsToDelete) {
                if (recording.id) {
                  try {
                    const response = await fetch(
                      `${API_ENDPOINTS.FILES}/${recording.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    if (!response.ok) {
                      hasError = true;
                      console.error(
                        `Không thể xóa file có ID: ${recording.id}. Mã lỗi: ${response.status}`
                      );
                    } else {
                      console.log(
                        `Đã xóa file âm thanh có ID: ${recording.id}`
                      );
                    }
                  } catch (error) {
                    hasError = true;
                    console.error(
                      `Lỗi khi xóa file ID ${recording.id}:`,
                      error
                    );
                  }
                }
              }

              // Cập nhật state, xóa tất cả bản ghi âm
              setRecordings([]);

              if (hasError) {
                showAlert(
                  "warning",
                  "Warning",
                  "Some files could not be deleted. Please try again later."
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Lỗi khi xóa các bản ghi âm:", error.message);
      showAlert(
        "error",
        "Error",
        "Unable to delete audio recordings. Please try again later."
      );
    }
  };

  // Xử lý cập nhật record
  const handleSave = async () => {
    try {
      console.log("Cập nhật record:", {
        id,
        date,
        mood: moodId,
        activities: selectedActivities,
        note,
        recordings,
        images,
      });

      // Tách title và content từ note
      const lines = note.split("\n");
      const title = lines[0] || "Chưa có tiêu đề";
      // Lấy tất cả các dòng còn lại làm content, bỏ qua dòng đầu tiên (title)
      const content = lines.slice(1).join("\n").trim();

      // Mảng chứa thông tin file mới sau khi đã upload lên Supabase Storage
      const newFiles = [];

      // Hiển thị dialog loading
      showAlert("info", "Processing", "Uploading files, please wait...");

      // Upload ảnh mới lên Supabase Storage
      const newImages = images.filter((img) => img.id === 0);
      for (const img of newImages) {
        try {
          // Upload lên Supabase Storage
          const fileInfo = await uploadFileFromBase64(
            img.url,
            "image/jpeg",
            "images",
            `user_1` // thay bằng user ID thực
          );

          console.log("File ảnh đã upload:", fileInfo);

          // Thêm thông tin file vào mảng newFiles
          newFiles.push({
            fname: fileInfo.fileName,
            type: "image/jpeg",
            url: fileInfo.url,
            fkey: fileInfo.key,
            size: fileInfo.size || 1024,
          });
        } catch (error) {
          console.error("Lỗi khi upload ảnh:", error);
        }
      }

      // Upload recordings mới lên Supabase Storage
      const newRecordings = recordings.filter((rec) => !rec.id);
      for (const rec of newRecordings) {
        try {
          const isMusic = rec.isMusic || false;
          const fileType = isMusic ? "audio/mpeg" : "audio/m4a";

          // Upload lên Supabase Storage
          const fileInfo = await uploadAudioFromUri(
            rec.file,
            fileType,
            `user_1` // thay bằng user ID thực
          );

          console.log("File âm thanh đã upload:", fileInfo);

          // Thêm thông tin file vào mảng newFiles
          newFiles.push({
            fname: rec.name || fileInfo.fileName,
            type: fileType,
            url: fileInfo.url,
            fkey: fileInfo.key,
            size: fileInfo.size || 2048,
            duration: rec.duration,
          });
        } catch (error) {
          console.error("Lỗi khi upload recording:", error);
        }
      }

      // Cập nhật record thông qua API với phương thức PATCH
      const response = await fetch(`${API_ENDPOINTS.RECORDS}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: content,
          mood_id: moodId,
          date: date.toISOString(),
          activity_ids: selectedActivities,
          new_files: newFiles,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Không thể cập nhật dữ liệu. Mã lỗi: ${response.status}`
        );
      }

      showAlert("success", "Success", "Record updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật record:", error.message);
      showAlert(
        "error",
        "Error",
        "Unable to update record. Please try again later."
      );
    }
  };

  // Xử lý xóa record
  const handleDeleteRecord = () => {
    showAlert(
      "warning",
      "Confirm Delete",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Xóa record qua API
              const response = await fetch(`${API_ENDPOINTS.RECORDS}/${id}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                throw new Error(
                  `Không thể xóa dữ liệu. Mã lỗi: ${response.status}`
                );
              }

              showAlert("success", "Success", "Record deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error("Lỗi khi xóa record:", error.message);
              showAlert(
                "error",
                "Error",
                "Unable to delete record. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Header title="Error" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Back button với emoji */}
          <BackHeaderWithEmoji moodId={moodId} onBack={handleBack} />

          {/* Tiêu đề */}
          <View style={styles.headerContainer}>
            <Header title="Edit Mood" />
          </View>

          {/* Date Time Selector */}
          <DateTimeSelector date={date} setDate={setDate} />

          {/* Mood Selector */}
          <MoodSelector selectedMood={moodId} onSelectMood={handleSelectMood} />

          {/* Activities */}
          <ActivitiesSelector
            selectedActivities={selectedActivities}
            onActivitySelect={handleActivitySelect}
          />

          {/* Note Section */}
          <NoteSection
            note={note}
            onChangeNote={handleChangeNote}
            isFullNoteOpen={isFullNoteOpen}
            onToggleFullNote={handleToggleFullNote}
          />

          {/* Image Section */}
          <ImageSection
            images={images.map((img) => img.url)} // Truyền mảng URL cho component
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
            onDeleteImage={handleDeleteImage}
          />

          {/* Audio Section */}
          <AudioSection
            recordings={recordings}
            setRecordings={setRecordings}
            onClearAll={handleClearAllRecordings} // Thêm prop mới để xử lý xóa tất cả
          />

          {/* Nút Lưu */}
          <View style={styles.buttonContainer}>
            <SaveButton onSave={handleSave} />
          </View>

          {/* Nút Xóa */}
          <View style={styles.deleteButtonContainer}>
            <DeleteButton onDelete={handleDeleteRecord} />
          </View>
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
    backgroundColor: "#E0F7ED", // Cập nhật màu giống activity.tsx
    paddingTop: hp(2),
  },
  content: {
    flex: 1,
    padding: wp(5),
    paddingBottom: hp(10),
  },
  headerContainer: {
    alignItems: "center",
    marginVertical: hp(2),
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
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: wp(5),
  },
  errorText: {
    fontSize: wp(4),
    fontFamily: "Quicksand-Medium",
    color: "#EF4444",
    textAlign: "center",
    marginTop: hp(2),
  },
  buttonContainer: {
    marginTop: hp(3),
    alignItems: "center",
  },
  deleteButtonContainer: {
    marginTop: hp(2),
    alignItems: "center",
  },
});
