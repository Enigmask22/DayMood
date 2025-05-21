import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Dimensions,
} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const Greeting = () => {
    const router = useRouter();
    return (
        <View style={styles.greetingContainer}>
            <TouchableOpacity onPress={() => router.push('/(main)')} style={{ marginLeft: width * 0.05 }}>
                <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.greetingText}>Hello there,</Text>
                    <Text style={styles.nameText}>Hung Jonathan</Text>
                </View>
                <Image
                    source={require("@/assets/images/home/home_avatar.png")} // Replace with actual profile image URL'
                    style={styles.profileImage}
                />
            </View>
            <Image
                source={require("@/assets/images/home/home_bg.png")} // Replace with actual profile image URL'
                style={styles.greetingImage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    greetingImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        borderBottomLeftRadius: width * 0.08,
        borderBottomRightRadius: width * 0.08,
    },
    greetingContainer: {
        position: "relative",
        height: height * 0.2,
        overflow: "hidden",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    greetingText: {
        fontFamily: "Quicksand-Semibold",
        fontSize: width * 0.035,
        color: "#000",
    },
    nameText: {
        fontFamily: "Quicksand-Bold",
        fontSize: width * 0.045,
        fontWeight: "600",
        color: "#000",
    },
    nameContainer: {
        flexDirection: "column",
        marginLeft: width * 0.025,
    },
    profileImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: width * 0.025,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.05,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
    },
    quoteContainer: {
        position: "absolute",
        bottom: height * 0.35 * 0.15,
        width: width * 0.9,
        alignSelf: "center",
        backgroundColor: "#fff",
        opacity: 0.97,
        padding: width * 0.04,
        borderRadius: width * 0.04,
        marginBottom: height * 0.02,
    },
    quoteText: {
        fontFamily: "Quicksand-Semibold",
        fontSize: width * 0.035,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },
});

export default Greeting;
