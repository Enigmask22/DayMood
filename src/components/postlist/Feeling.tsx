import { Image } from "expo-image";
import { Dimensions, View } from "react-native";
import { StyleSheet, Text } from "react-native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { EMOJI_COLOR } from "src/utils/constant";
const { width, height } = Dimensions.get("window");
// Mapping of emoji names to their image paths
const emojiMap: { [key: string]: any } = {
    sad: require("@/assets/emoji/sad.gif"),
    excellent: require("@/assets/emoji/excellent.gif"),
    joyful: require("@/assets/emoji/joyful.gif"),
    normal: require("@/assets/emoji/normal.gif"),
    angry: require("@/assets/emoji/angry.gif"),
    // Add more emojis as needed
};

const Feeling = ({
    emoji = "normal",
}: {
    emoji: string,
}) => {

    const emojiSource = emojiMap[emoji] || emojiMap["normal"]; // Fallback to a default emoji if not found
    const getButtonColor = () => {
        switch (emoji) {
            case "normal":
                return EMOJI_COLOR.NORMAL;
            case "angry":
                return EMOJI_COLOR.ANGRY;
            case "sad":
                return EMOJI_COLOR.SAD;
            case "excellent":
                return EMOJI_COLOR.EXCELLENT;
            case "joyful":
                return EMOJI_COLOR.JOYFUL;
            default:
                return "#2E7D32"; // Màu mặc định nếu không khớp
        }
    };
    const styles = StyleSheet.create({
        wrapper: {
            position: 'relative',
            alignItems: 'center',
            zIndex: 1,
        },
        container: {
            padding: width * 0.008,
            borderWidth: 4,
            borderRadius: 999, // Use a number instead of '100%'
            borderColor: getButtonColor(),
            zIndex: 2,
            backgroundColor: "white",
        },
        imageContainer: {
            width: width * 0.15,
            height: width * 0.15,
            justifyContent: "center",
            alignItems: "center",
        },
        verticalElement: {
            width: 5,
            height: width * 0.5,
            backgroundColor: "#A3A0A0",
            position: "absolute",
            left: '50%',
            marginLeft: -2.5, // Half of the width to center it
            top: '50%',
            zIndex: 0,
        }
    });
    return (
        <View style={styles.wrapper}>
            <View style={styles.verticalElement} />
            <View style={styles.container}>
                <Image
                    source={emojiSource}
                    contentFit="contain"
                    autoplay={true}
                    style={styles.imageContainer}
                />
            </View>
        </View>
    )
}

export default Feeling;