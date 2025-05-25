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
}: {
  item: {
    title: string;
    content: string | ReactNode;
    emoji: ImageSourcePropType | undefined;
    indicator: boolean[];
  };
  index: number;
}) => {
  // Define gradient colors based on card type
  const getGradientColors = (): [string, string] => {
    if (index === 2) {
      return ["#667eea", "#764ba2"]; // Purple gradient for advice
    }
    return ["#11998e", "#38ef7d"]; // Green gradient for stats
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

        {/* Content Section */}
        <View style={styles.modernContentContainer}>
          <View style={styles.modernContentCard}>
            <Text style={styles.modernTitle}>{item.title}</Text>

            <View style={styles.contentDivider} />

            <Text
              style={[
                styles.modernContentText,
                index === 2
                  ? styles.adviceContentText
                  : styles.statsContentText,
              ]}
            >
              {item.content}
            </Text>

            {index === 2 && (
              <View style={styles.modernAdviceFooter}>
                <View style={styles.modernDividerContainer}>
                  <View style={styles.modernDivider} />
                  <View style={styles.iconContainer}>
                    <Ionicons name="bulb" size={20} color="#667eea" />
                  </View>
                  <View style={styles.modernDivider} />
                </View>
                <Text style={styles.adviceFooterText}>
                  Personalized recommendation
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
    marginVertical: 8,
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
    fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "System",
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
    fontFamily: "System",
  },
  statsContentText: {
    fontSize: width * 0.042,
    color: "#2d3748",
    fontWeight: "500",
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
