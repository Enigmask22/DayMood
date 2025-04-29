import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
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

export default function CardDetailScreen() {
  // Nhận các tham số từ navigation
  const params = useLocalSearchParams();
  const moodId = params.mood ? parseInt(params.mood as string) : 4; // Default to joyful
  const note = (params.note as string) || "";
  const dateParam = params.date as string;

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
    hasAudioRecording: true,
    audioRecording: {
      duration: "00:05",
    },
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

          {/* Audio Recording Player */}
          {cardData.hasAudioRecording && (
            <View style={styles.audioPlayer}>
              <FontAwesome5 name="wave-square" size={wp(5)} color="#333" />
              <Text style={styles.audioDuration}>
                {cardData.audioRecording.duration}
              </Text>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={wp(5)} color="#333" />
              </TouchableOpacity>
            </View>
          )}

          {/* Music Player */}
          {cardData.hasMusic && (
            <View style={styles.musicPlayer}>
              <FontAwesome5 name="music" size={wp(5)} color="#333" />
              <Text style={styles.musicTitle}>{cardData.music.title}</Text>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={wp(5)} color="#333" />
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
  playButton: {
    backgroundColor: "transparent",
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
});
