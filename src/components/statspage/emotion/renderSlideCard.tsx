import {
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
  View,
  Text,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
const { width, height } = Dimensions.get("window");
// Function to render a single slide card
export const renderSlideCard = ({
  item,
  index,
  monthType = 'current' // 'current', 'past', or 'future'
}: {
  item: {
    title: string;
    content: string | ReactNode;
    emoji: ImageSourcePropType | undefined;
    indicator: boolean[];
  };
  index: number;
  monthType?: 'current' | 'past' | 'future';
}) => {
  if ((monthType === 'past' && index !== 1) ||
    (monthType === 'future' && index !== 2)) {
    return null;
  }

  // Define gradient colors based on card type and month
  const getGradientColors = (): [string, string] => {
    if (index === 2) {
      // Tip/advice card
      if (monthType === 'future') {
        return ["#3B82F6", "#1D4ED8"]; // Blue gradient for future month
      }
      return ["#667eea", "#764ba2"]; // Purple gradient for regular advice
    }
    return ["#11998e", "#38ef7d"]; // Green gradient for stats
  };

  // Modify content for future months
  const getContent = () => {
    if (monthType === 'future' && index === 2) {
      return (
        <Text style={[styles.modernContentText, styles.adviceContentText]}>
          No data available for future months. Use this time to plan activities that improve your mood!
        </Text>
      );
    }
    return item.content;
  };

  // Modify title for future months
  const getTitle = () => {
    if (monthType === 'future' && index === 2) {
      return "Looking ahead";
    }
    return item.title;
  };

  return (
    <View style={styles.modernSlideContainer}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernCardGradient}
      >
        {/* Emoji Section */}
        {item.emoji && (
          <View style={styles.modernEmojiContainer}>
            <View style={styles.emojiBackdrop}>
              <Image
                style={styles.emojiImage}
                source={item.emoji}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Future month icon (calendar) */}
        {monthType === 'future' && (
          <View style={styles.modernEmojiContainer}>
            <View style={styles.emojiBackdrop}>
              <Ionicons name="calendar-outline" size={width * 0.12} color="#FFF" />
            </View>
          </View>
        )}

        {/* Content Section */}
        <View style={styles.modernContentContainer}>
          <View style={styles.modernContentCard}>
            <Text style={styles.modernTitle}>{getTitle()}</Text>

            <View style={styles.contentDivider} />

            <Text
              style={[
                styles.modernContentText,
                index === 2 || monthType === 'future'
                  ? styles.adviceContentText
                  : styles.statsContentText,
              ]}
            >
              {getContent()}
            </Text>

            {/* Footer for advice cards */}
            {(index === 2 || monthType === 'future') && (
              <View style={styles.modernAdviceFooter}>
                <View style={styles.modernDividerContainer}>
                  <View style={styles.modernDivider} />
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={monthType === 'future' ? "time-outline" : "bulb"}
                      size={20}
                      color={monthType === 'future' ? "#3B82F6" : "#667eea"}
                    />
                  </View>
                  <View style={styles.modernDivider} />
                </View>
                <Text style={[
                  styles.adviceFooterText,
                  monthType === 'future' && { color: '#3B82F6' }
                ]}>
                  {monthType === 'future'
                    ? "Future planning"
                    : "Personalized recommendation"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modern Slide Container
  modernSlideContainer: {
    width: width,
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.02,
    paddingBottom: height * 0.08
  },
  modernCardGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },

  // Emoji Section
  modernEmojiContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  emojiBackdrop: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiImage: {
    width: width * 0.16,
    height: width * 0.16,
  },

  // Content Section
  modernContentContainer: {
    flex: 1,
  },
  modernContentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    backdropFilter: "blur(10px)",
  },
  modernTitle: {
    fontSize: width * 0.05,
    //fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Quicksand-Bold",
  },
  contentDivider: {
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 1,
    marginVertical: 12,
  },

  // Content Text
  modernContentText: {
    textAlign: "center",
    lineHeight: width * 0.06,
    fontFamily: "Quicksand-Semibold",
  },
  statsContentText: {
    fontSize: width * 0.042,
    color: "#2d3748",
    fontFamily: "Quicksand-Bold",
  },
  adviceContentText: {
    fontSize: width * 0.04,
    color: "#4a5568",
    fontWeight: "400",
    lineHeight: width * 0.058,
  },

  // Advice Footer
  modernAdviceFooter: {
    marginTop: 16,
    paddingTop: 16,
  },
  modernDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modernDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(102, 126, 234, 0.3)",
  },
  iconContainer: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 12,
  },
  adviceFooterText: {
    fontSize: width * 0.032,
    color: "#667eea",
    textAlign: "center",
    fontWeight: "600",
    fontStyle: "italic",
    fontFamily: "System",
  },
});
